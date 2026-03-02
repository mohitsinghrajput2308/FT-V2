/**
 * FinanceContext — Secure Supabase-Only Data Layer
 *
 * SECURITY ARCHITECTURE:
 *   Dashboard Component
 *     → FinanceContext (this file — state management)
 *       → secureApi.js (validation + rate limiting + sanitization)
 *         → supabaseService.js (field mapping + Supabase queries)
 *           → Supabase (RLS-protected PostgreSQL)
 *
 * DATA POLICY:
 *   - Financial data (transactions, budgets, goals, investments, bills, categories)
 *     is stored ONLY in Supabase. Never cached to localStorage.
 *   - Non-sensitive preferences (currency, date format) may use localStorage.
 *   - All inputs are validated and sanitized before reaching the database.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchFxRates, convertCurrency as fxConvert, SYMBOL_TO_CODE } from '../utils/fxService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from './NotificationContext';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { getCurrentMonth } from '../utils/helpers';

// ─── SINGLE SECURITY GATEWAY ──────────────────────────────────
// All data flows through secureApi → supabaseService → Supabase
import SecureAPI from '../utils/secureApi';

const FinanceContext = createContext();

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};

export const FinanceProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { success, error: notifyError } = useNotification();

    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [bills, setBills] = useState([]);
    const [categories, setCategories] = useState({ expense: [], income: [] });
    const [settings, setSettings] = useState({ currency: '$', dateFormat: 'MM/DD/YYYY' });
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline'
    const [fxRates, setFxRates] = useState(null);
    const [fxRatesLoading, setFxRatesLoading] = useState(false);

    const userId = currentUser?.id;
    const hasFetched = useRef(false);

    // ── Load data from Supabase via Secure API (no localStorage for financial data) ──
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        if (hasFetched.current) return;
        hasFetched.current = true;

        let cancelled = false;
        const fetchAll = async () => {
            setSyncStatus('syncing');
            try {
                const [txRes, budRes, goalRes, invRes, billRes, catRes, settRes] = await Promise.allSettled([
                    SecureAPI.transactions.getAll(userId),
                    SecureAPI.budgets.getAll(userId),
                    SecureAPI.goals.getAll(userId),
                    SecureAPI.investments.getAll(userId),
                    SecureAPI.bills.getAll(userId),
                    SecureAPI.categories.getAll(userId),
                    SecureAPI.settings.get(),
                ]);

                if (cancelled) return;

                // For financial data: Supabase or empty (NO localStorage fallback)
                const resolveSecure = (result, fallback) => {
                    if (result.status === 'fulfilled' && result.value.data && !result.value.error) {
                        return result.value.data;
                    }
                    return fallback;
                };

                // Settings only: allow localStorage fallback (non-sensitive)
                const resolveSettings = (result) => {
                    if (result.status === 'fulfilled' && result.value.data && !result.value.error) {
                        try { saveToStorage(STORAGE_KEYS.SETTINGS, result.value.data); } catch { /* silent */ }
                        return result.value.data;
                    }
                    return getFromStorage(STORAGE_KEYS.SETTINGS, { currency: '$', dateFormat: 'MM/DD/YYYY' });
                };

                setTransactions(resolveSecure(txRes, []));
                setBudgets(resolveSecure(budRes, []));
                setGoals(resolveSecure(goalRes, []));
                setInvestments(resolveSecure(invRes, []));
                setBills(resolveSecure(billRes, []));
                setCategories(resolveSecure(catRes, { expense: [], income: [] }));
                setSettings(resolveSettings(settRes));

                const financialResults = [txRes, budRes, goalRes, invRes, billRes, catRes];
                const allSucceeded = financialResults
                    .every(r => r.status === 'fulfilled' && r.value.data && !r.value.error);
                setSyncStatus(allSucceeded ? 'synced' : 'offline');

            } catch (err) {
                console.error('[FinanceContext] Sync failed:', err);
                if (cancelled) return;
                setSettings(getFromStorage(STORAGE_KEYS.SETTINGS, { currency: '$', dateFormat: 'MM/DD/YYYY' }));
                setSyncStatus('offline');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAll();
        return () => { cancelled = true; };
    }, [userId]);

    useEffect(() => { hasFetched.current = false; }, [userId]);

    // ── Fetch live FX rates (updates whenever currency setting changes) ──
    useEffect(() => {
        let cancelled = false;
        const loadRates = async () => {
            setFxRatesLoading(true);
            try {
                const rates = await fetchFxRates();
                if (!cancelled) setFxRates(rates);
            } catch { /* falls back to static rates inside fxService */ }
            finally { if (!cancelled) setFxRatesLoading(false); }
        };
        loadRates();
        return () => { cancelled = true; };
    }, [settings.currency]);

    const convertCurrency = useCallback((amount, fromSymbol, toSymbol) =>
        fxConvert(
            amount,
            SYMBOL_TO_CODE[fromSymbol] ?? 'USD',
            SYMBOL_TO_CODE[toSymbol]   ?? 'USD',
            fxRates
        ),
    [fxRates]);

    // ── Filter data by current user ──
    const userTransactions = transactions.filter(t => !t.userId || t.userId === userId);
    const userBudgets = budgets.filter(b => !b.userId || b.userId === userId);
    const userGoals = goals.filter(g => !g.userId || g.userId === userId);
    const userInvestments = investments.filter(i => !i.userId || i.userId === userId);
    const userBills = bills.filter(b => !b.userId || b.userId === userId);

    // ─── TRANSACTION CRUD ─────────────────────────────────────
    const addTransaction = useCallback(async (data) => {
        const result = await SecureAPI.transactions.create(data, userId);
        if (result.error) {
            notifyError?.(result.error);
            return null;
        }
        setTransactions(prev => [result.data, ...prev]);
        success?.(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully`);
        return result.data;
    }, [userId, success, notifyError]);

    const updateTransaction = useCallback(async (id, data) => {
        const result = await SecureAPI.transactions.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...result.data } : t));
        success?.('Transaction updated');
    }, [userId, success, notifyError]);

    const deleteTransaction = useCallback(async (id) => {
        const result = await SecureAPI.transactions.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setTransactions(prev => prev.filter(t => t.id !== id));
        success?.('Transaction deleted');
    }, [userId, success, notifyError]);

    // ─── BUDGET CRUD ──────────────────────────────────────────
    const addBudget = useCallback(async (data) => {
        const result = await SecureAPI.budgets.create(data, userId);
        if (result.error) { notifyError?.(result.error); return null; }
        setBudgets(prev => [...prev, result.data]);
        success?.('Budget created');
        return result.data;
    }, [userId, success, notifyError]);

    const updateBudget = useCallback(async (id, data) => {
        const result = await SecureAPI.budgets.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...result.data } : b));
        success?.('Budget updated');
    }, [userId, success, notifyError]);

    const deleteBudget = useCallback(async (id) => {
        const result = await SecureAPI.budgets.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setBudgets(prev => prev.filter(b => b.id !== id));
        success?.('Budget deleted');
    }, [userId, success, notifyError]);

    // ─── GOALS CRUD ───────────────────────────────────────────
    const addGoal = useCallback(async (data) => {
        const result = await SecureAPI.goals.create(data, userId);
        if (result.error) { notifyError?.(result.error); return null; }
        setGoals(prev => [...prev, result.data]);
        success?.('Goal created');
        return result.data;
    }, [userId, success, notifyError]);

    const updateGoal = useCallback(async (id, data) => {
        const result = await SecureAPI.goals.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...result.data } : g));
        success?.('Goal updated');
    }, [userId, success, notifyError]);

    const deleteGoal = useCallback(async (id) => {
        const result = await SecureAPI.goals.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setGoals(prev => prev.filter(g => g.id !== id));
        success?.('Goal deleted');
    }, [userId, success, notifyError]);

    const addToGoal = useCallback(async (id, amount) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
            await updateGoal(id, { currentAmount: newAmount });
            if (newAmount >= goal.targetAmount) {
                success?.('🎉 Congratulations! Goal completed!');
            }
        }
    }, [goals, updateGoal, success]);

    // ─── INVESTMENTS CRUD ─────────────────────────────────────
    const addInvestment = useCallback(async (data) => {
        const result = await SecureAPI.investments.create(data, userId);
        if (result.error) { notifyError?.(result.error); return null; }
        setInvestments(prev => [...prev, result.data]);
        success?.('Investment added');
        return result.data;
    }, [userId, success, notifyError]);

    const updateInvestment = useCallback(async (id, data) => {
        const result = await SecureAPI.investments.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...result.data } : i));
        success?.('Investment updated');
    }, [userId, success, notifyError]);

    const deleteInvestment = useCallback(async (id) => {
        const result = await SecureAPI.investments.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setInvestments(prev => prev.filter(i => i.id !== id));
        success?.('Investment deleted');
    }, [userId, success, notifyError]);

    // ─── BILLS CRUD ───────────────────────────────────────────
    const addBill = useCallback(async (data) => {
        const result = await SecureAPI.bills.create(data, userId);
        if (result.error) { notifyError?.(result.error); return null; }
        setBills(prev => [...prev, result.data]);
        success?.('Bill reminder added');
        return result.data;
    }, [userId, success, notifyError]);

    const updateBill = useCallback(async (id, data) => {
        const result = await SecureAPI.bills.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setBills(prev => prev.map(b => b.id === id ? { ...b, ...result.data } : b));
        success?.('Bill updated');
    }, [userId, success, notifyError]);

    const deleteBill = useCallback(async (id) => {
        const result = await SecureAPI.bills.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setBills(prev => prev.filter(b => b.id !== id));
        success?.('Bill deleted');
    }, [userId, success, notifyError]);

    const markBillPaid = useCallback(async (id) => {
        await updateBill(id, { isPaid: true, paidDate: new Date().toISOString().split('T')[0] });
    }, [updateBill]);

    // ─── CATEGORIES CRUD ──────────────────────────────────────
    const addCategory = useCallback(async (type, category) => {
        const result = await SecureAPI.categories.create(type, category, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), result.data]
        }));
        success?.('Category added');
    }, [userId, success, notifyError]);

    const updateCategory = useCallback(async (type, id, data) => {
        const result = await SecureAPI.categories.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].map(c => c.id === id ? { ...c, ...result.data } : c)
        }));
        success?.('Category updated');
    }, [userId, success, notifyError]);

    const deleteCategory = useCallback(async (type, id) => {
        const result = await SecureAPI.categories.delete(id, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].filter(c => c.id !== id)
        }));
        success?.('Category deleted');
    }, [userId, success, notifyError]);

    // ─── SETTINGS (localStorage OK — non-sensitive) ───────────
    const updateSettings = useCallback(async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);
        try { saveToStorage(STORAGE_KEYS.SETTINGS, merged); } catch { /* silent */ }

        const result = await SecureAPI.settings.upsert(merged, userId);
        if (result.error) {
            console.warn('[FinanceContext] Settings sync failed, local save preserved.');
        }
        success?.('Settings saved');
    }, [settings, userId, success]);

    // ─── Computed values ──────────────────────────────────────
    const currentMonth = getCurrentMonth();
    const monthlyIncome = userTransactions
        .filter(t => t.type === 'income' && t.date?.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = userTransactions
        .filter(t => t.type === 'expense' && t.date?.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = userTransactions.reduce((sum, t) =>
        t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

    const totalSavings = userGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

    const totalInvestmentValue = userInvestments.reduce((sum, i) =>
        sum + ((i.currentValue || 0) * (i.quantity || 0)), 0);

    const pendingBillsCount = userBills.filter(b => !b.isPaid).length;

    const value = {
        loading,
        syncStatus,
        transactions: userTransactions,
        budgets: userBudgets,
        goals: userGoals,
        investments: userInvestments,
        bills: userBills,
        categories,
        settings,
        addTransaction, updateTransaction, deleteTransaction,
        addBudget, updateBudget, deleteBudget,
        addGoal, updateGoal, deleteGoal, addToGoal,
        addInvestment, updateInvestment, deleteInvestment,
        addBill, updateBill, deleteBill, markBillPaid,
        addCategory, updateCategory, deleteCategory,
        updateSettings,
        monthlyIncome, monthlyExpenses, totalBalance,
        totalSavings, totalInvestmentValue, pendingBillsCount,
        currency: settings.currency || '$',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY',
        fxRates,
        fxRatesLoading,
        convertCurrency,
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};

export default FinanceContext;
