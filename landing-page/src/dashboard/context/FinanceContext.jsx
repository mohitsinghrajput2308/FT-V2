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

const DEFAULT_CATEGORIES = {
    expense: [
        { id: 'cat_food', name: 'Food', color: '#ef4444', type: 'expense' },
        { id: 'cat_transport', name: 'Transport', color: '#f59e0b', type: 'expense' },
        { id: 'cat_entertainment', name: 'Entertainment', color: '#8b5cf6', type: 'expense' },
        { id: 'cat_shopping', name: 'Shopping', color: '#ec4899', type: 'expense' },
        { id: 'cat_bills', name: 'Bills', color: '#3b82f6', type: 'expense' },
        { id: 'cat_healthcare', name: 'Healthcare', color: '#10b981', type: 'expense' },
        { id: 'cat_education', name: 'Education', color: '#6366f1', type: 'expense' },
    ],
    income: [
        { id: 'inc_salary', name: 'Salary', color: '#10b981', type: 'income' },
        { id: 'inc_freelance', name: 'Freelance', color: '#3b82f6', type: 'income' },
        { id: 'inc_business', name: 'Business', color: '#8b5cf6', type: 'income' },
        { id: 'inc_investment', name: 'Investment Returns', color: '#f59e0b', type: 'income' },
        { id: 'inc_gift', name: 'Gift', color: '#ec4899', type: 'income' },
    ]
};

const FinanceContext = createContext();

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};

export const FinanceProvider = ({ children }) => {
    const { currentUser, refreshSession } = useAuth();
    const { success, error: notifyError } = useNotification();

    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [bills, setBills] = useState([]);
    const [categories, setCategories] = useState({ expense: [], income: [] });
    // Initialize settings from localStorage to restore user preferences on page reload
    const [settings, setSettings] = useState(() => 
        getFromStorage(STORAGE_KEYS.SETTINGS, { currency: '$', dateFormat: 'MM/DD/YYYY' })
    );
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline'
    const [fxRates, setFxRates] = useState(null);
    const [fxRatesLoading, setFxRatesLoading] = useState(false);

    const userId = currentUser?.id;
    const hasFetched = useRef(false);
    // Stable ref to fetchAll so visibility/online handlers always call the latest version
    const fetchAllRef = useRef(null);

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
                    SecureAPI.settings.get(userId),
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
                    const savedLocally = getFromStorage(STORAGE_KEYS.SETTINGS);

                    // If we have successful Supabase data, merge with localStorage
                    // (localStorage takes precedence to preserve user preferences)
                    if (result.status === 'fulfilled' && result.value.data && !result.value.error) {
                        const merged = { ...result.value.data, ...savedLocally };
                        try { saveToStorage(STORAGE_KEYS.SETTINGS, merged); } catch { /* silent */ }
                        return merged;
                    }

                    // Fall back to localStorage with default fallback
                    return savedLocally || { currency: '$', dateFormat: 'MM/DD/YYYY' };
                };

                setTransactions(resolveSecure(txRes, []));
                setBudgets(resolveSecure(budRes, []));
                setGoals(resolveSecure(goalRes, []));
                setInvestments(resolveSecure(invRes, []));
                setBills(resolveSecure(billRes, []));
                const fetchedCategories = resolveSecure(catRes, { expense: [], income: [] });
                setCategories({
                    expense: [...DEFAULT_CATEGORIES.expense, ...(fetchedCategories.expense || [])],
                    income: [...DEFAULT_CATEGORIES.income, ...(fetchedCategories.income || [])]
                });
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

        // Keep the ref up-to-date so visibility/online handlers can call the latest version
        fetchAllRef.current = fetchAll;

        fetchAll();
        return () => { cancelled = true; };
    }, [userId]);

    // Reset the hasFetched guard when the user changes (login / logout)
    useEffect(() => { hasFetched.current = false; }, [userId]);

    // ── Tab-visibility recovery: re-sync when user switches back to this tab ──
    // This is the PRIMARY fix for the "dashboard goes silent after tab switch" bug.
    // When the browser resumes a background tab, supabase-js's internal handler
    // refreshes the JWT first. We add a short delay so the token refresh completes
    // before we re-fetch data, avoiding stale-token errors.
    useEffect(() => {
        if (!userId) return;

        let visibilityTimeout = null;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Clear any pending timeout (e.g. rapid tab switching)
                if (visibilityTimeout) clearTimeout(visibilityTimeout);

                // Wait briefly for supabase-js's internal token refresh to complete
                // before re-fetching all data with a (hopefully) fresh JWT.
                visibilityTimeout = setTimeout(() => {
                    console.log('[FinanceContext] Tab became visible — re-syncing data...');
                    hasFetched.current = false;
                    fetchAllRef.current?.();
                    hasFetched.current = true;
                }, 1500); // 1.5s — enough for supabase-js token refresh round-trip
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (visibilityTimeout) clearTimeout(visibilityTimeout);
        };
    }, [userId]);

    // ── Network-recovery: re-sync when browser comes back online ──
    useEffect(() => {
        if (!userId) return;

        const handleOnline = () => {
            console.log('[FinanceContext] Network restored — re-syncing data...');
            hasFetched.current = false;
            fetchAllRef.current?.();
            hasFetched.current = true;
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [userId]);

    // ── Manual retry: exposed in context so UI can offer a "Retry" button ──
    const retrySync = useCallback(() => {
        if (!userId) return;
        hasFetched.current = false;
        fetchAllRef.current?.();
        hasFetched.current = true;
    }, [userId]);

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
            SYMBOL_TO_CODE[toSymbol] ?? 'USD',
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
            console.error('[FinanceContext] Transaction creation failed:', result.error);
            // Check if error is auth-related
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                console.log('[FinanceContext] Auth error detected - attempting session refresh...');
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return null;
                }
                // Retry once
                const retryResult = await SecureAPI.transactions.create(data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return null;
                }
                setTransactions(prev => [retryResult.data, ...prev]);
                success?.(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully`);
                return retryResult.data;
            }
            notifyError?.(result.error);
            return null;
        }
        setTransactions(prev => [result.data, ...prev]);
        success?.(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully`);
        return result.data;
    }, [userId, success, notifyError, refreshSession]);

    const updateTransaction = useCallback(async (id, data) => {
        const result = await SecureAPI.transactions.update(id, data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.transactions.update(id, data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...retryResult.data } : t));
                success?.('Transaction updated');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...result.data } : t));
        success?.('Transaction updated');
    }, [userId, success, notifyError, refreshSession]);

    const deleteTransaction = useCallback(async (id) => {
        const result = await SecureAPI.transactions.delete(id, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.transactions.delete(id, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setTransactions(prev => prev.filter(t => t.id !== id));
                success?.('Transaction deleted');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setTransactions(prev => prev.filter(t => t.id !== id));
        success?.('Transaction deleted');
    }, [userId, success, notifyError, refreshSession]);

    // ─── BUDGET CRUD ──────────────────────────────────────────
    const addBudget = useCallback(async (data, limitInfo = null) => {
        const result = await SecureAPI.budgets.create(data, userId, limitInfo);
        if (result.error) {
            console.error('[FinanceContext] Budget creation failed:', result.error);
            // Check if error is auth-related
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                console.log('[FinanceContext] Auth error detected - attempting session refresh...');
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return null;
                }
                // Retry once
                const retryResult = await SecureAPI.budgets.create(data, userId, limitInfo);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return null;
                }
                setBudgets(prev => [...prev, retryResult.data]);
                success?.('Budget created');
                return retryResult.data;
            }
            notifyError?.(result.error);
            return null;
        }
        setBudgets(prev => [...prev, result.data]);
        success?.('Budget created');
        return result.data;
    }, [userId, success, notifyError, refreshSession]);

    const updateBudget = useCallback(async (id, data) => {
        const result = await SecureAPI.budgets.update(id, data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.budgets.update(id, data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...retryResult.data } : b));
                success?.('Budget updated');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...result.data } : b));
        success?.('Budget updated');
    }, [userId, success, notifyError, refreshSession]);

    const deleteBudget = useCallback(async (id) => {
        const result = await SecureAPI.budgets.delete(id, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.budgets.delete(id, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setBudgets(prev => prev.filter(b => b.id !== id));
                success?.('Budget deleted');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setBudgets(prev => prev.filter(b => b.id !== id));
        success?.('Budget deleted');
    }, [userId, success, notifyError, refreshSession]);

    // ─── GOALS CRUD ───────────────────────────────────────────
    const addGoal = useCallback(async (data, limitInfo = null) => {
        const result = await SecureAPI.goals.create(data, userId, limitInfo);
        if (result.error) {
            console.error('[FinanceContext] Goal creation failed:', result.error);
            // Check if error is auth-related
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                console.log('[FinanceContext] Auth error detected - attempting session refresh...');
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return null;
                }
                // Retry once
                const retryResult = await SecureAPI.goals.create(data, userId, limitInfo);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return null;
                }
                setGoals(prev => [...prev, retryResult.data]);
                success?.('Goal created');
                return retryResult.data;
            }
            notifyError?.(result.error);
            return null;
        }
        setGoals(prev => [...prev, result.data]);
        success?.('Goal created');
        return result.data;
    }, [userId, success, notifyError, refreshSession]);

    const updateGoal = useCallback(async (id, data) => {
        const result = await SecureAPI.goals.update(id, data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.goals.update(id, data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setGoals(prev => prev.map(g => g.id === id ? { ...g, ...retryResult.data } : g));
                success?.('Goal updated');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...result.data } : g));
        success?.('Goal updated');
    }, [userId, success, notifyError, refreshSession]);

    const deleteGoal = useCallback(async (id) => {
        const result = await SecureAPI.goals.delete(id, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.goals.delete(id, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setGoals(prev => prev.filter(g => g.id !== id));
                success?.('Goal deleted');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setGoals(prev => prev.filter(g => g.id !== id));
        success?.('Goal deleted');
    }, [userId, success, notifyError, refreshSession]);

    const addToGoal = useCallback(async (id, amount) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            const newAmount = (goal.currentAmount || 0) + amount;
            await updateGoal(id, { currentAmount: newAmount });
            if (newAmount >= goal.targetAmount && (goal.currentAmount || 0) < goal.targetAmount) {
                success?.('🎉 Congratulations! Goal completed!');
            }
        }
    }, [goals, updateGoal, success]);

    // ─── INVESTMENTS CRUD ─────────────────────────────────────
    const addInvestment = useCallback(async (data) => {
        const result = await SecureAPI.investments.create(data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return null;
                }
                const retryResult = await SecureAPI.investments.create(data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return null;
                }
                setInvestments(prev => [...prev, retryResult.data]);
                success?.('Investment added');
                return retryResult.data;
            }
            notifyError?.(result.error);
            return null;
        }
        setInvestments(prev => [...prev, result.data]);
        success?.('Investment added');
        return result.data;
    }, [userId, success, notifyError, refreshSession]);

    const updateInvestment = useCallback(async (id, data) => {
        const result = await SecureAPI.investments.update(id, data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.investments.update(id, data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...retryResult.data } : i));
                success?.('Investment updated');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...result.data } : i));
        success?.('Investment updated');
    }, [userId, success, notifyError, refreshSession]);

    // Silent price-only update: optimistic UI first, then background DB sync
    // Does NOT show any toast notification — used exclusively by price pollers.
    // Uses the dedicated updatePrice endpoint that bypasses the mutation rate limiter.
    const updateInvestmentPrice = useCallback(async (id, currentValue) => {
        const newPrice = Number(currentValue);
        if (!id || isNaN(newPrice) || newPrice <= 0) return;

        // 1. Update React state immediately — zero perceived latency
        setInvestments(prev => prev.map(i =>
            i.id === id ? { ...i, currentValue: newPrice } : i
        ));
        // 2. Persist to DB via rate-limit-free endpoint (fire and forget)
        SecureAPI.investments.updatePrice(id, newPrice).catch(() => {/* silent */});
    }, []);

    const deleteInvestment = useCallback(async (id) => {
        const result = await SecureAPI.investments.delete(id, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.investments.delete(id, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setInvestments(prev => prev.filter(i => i.id !== id));
                success?.('Investment deleted');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setInvestments(prev => prev.filter(i => i.id !== id));
        success?.('Investment deleted');
    }, [userId, success, notifyError, refreshSession]);

    // ─── BILLS CRUD ───────────────────────────────────────────
    const addBill = useCallback(async (data, limitInfo = null) => {
        const result = await SecureAPI.bills.create(data, userId, limitInfo);
        if (result.error) {
            console.error('[FinanceContext] Bill creation failed:', result.error);
            // Check if error is auth-related (401/403)
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                console.log('[FinanceContext] Auth error detected - attempting session refresh...');
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return null;
                }
                console.log('[FinanceContext] Session refreshed - retrying bill creation...');
                // Retry the operation once
                const retryResult = await SecureAPI.bills.create(data, userId, limitInfo);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return null;
                }
                setBills(prev => [...prev, retryResult.data]);
                success?.('Bill reminder added');
                return retryResult.data;
            }
            notifyError?.(result.error);
            return null;
        }
        setBills(prev => [...prev, result.data]);
        success?.('Bill reminder added');
        return result.data;
    }, [userId, success, notifyError, refreshSession]);

    const updateBill = useCallback(async (id, data) => {
        const result = await SecureAPI.bills.update(id, data, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.bills.update(id, data, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setBills(prev => prev.map(b => b.id === id ? { ...b, ...retryResult.data } : b));
                success?.('Bill updated');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setBills(prev => prev.map(b => b.id === id ? { ...b, ...result.data } : b));
        success?.('Bill updated');
    }, [userId, success, notifyError, refreshSession]);

    const deleteBill = useCallback(async (id) => {
        const result = await SecureAPI.bills.delete(id, userId);
        if (result.error) {
            const errorMsg = result.error?.toString().toLowerCase() || '';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || 
                errorMsg.includes('403') || errorMsg.includes('forbidden') ||
                errorMsg.includes('session') || errorMsg.includes('expired')) {
                const newSession = await refreshSession?.();
                if (!newSession) {
                    notifyError?.('Your session has expired. Please log in again.');
                    return;
                }
                const retryResult = await SecureAPI.bills.delete(id, userId);
                if (retryResult.error) {
                    notifyError?.(retryResult.error);
                    return;
                }
                setBills(prev => prev.filter(b => b.id !== id));
                success?.('Bill deleted');
                return;
            }
            notifyError?.(result.error);
            return;
        }
        setBills(prev => prev.filter(b => b.id !== id));
        success?.('Bill deleted');
    }, [userId, success, notifyError, refreshSession]);

    const markBillPaid = useCallback(async (id) => {
        await updateBill(id, { isPaid: true, paidDate: new Date().toISOString().split('T')[0] });
    }, [updateBill]);

    const unmarkBillPaid = useCallback(async (id) => {
        await updateBill(id, { isPaid: false, paidDate: null });
    }, [updateBill]);

    // ─── CATEGORIES CRUD ──────────────────────────────────────
    const addCategory = useCallback(async (type, category) => {
        const result = await SecureAPI.categories.create(type, category, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), result.data]
        }));
        // Reflect lifetime counter increment immediately in local state
        setSettings(prev => ({
            ...prev,
            customCategoriesCreated: (prev.customCategoriesCreated || 0) + 1
        }));
        success?.('Category added');
    }, [userId, success, notifyError]);

    const updateCategory = useCallback(async (type, id, data) => {
        if (id.startsWith('cat_') || id.startsWith('inc_')) {
            notifyError?.("Cannot edit built-in categories");
            return;
        }
        const result = await SecureAPI.categories.update(id, data, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].map(c => c.id === id ? { ...c, ...result.data } : c)
        }));
        success?.('Category updated');
    }, [userId, success, notifyError]);

    const deleteCategory = useCallback(async (type, id, categoryName) => {
        if (id.startsWith('cat_') || id.startsWith('inc_')) {
            notifyError?.("Cannot delete built-in categories");
            return;
        }
        const result = await SecureAPI.categories.delete(id, categoryName, userId);
        if (result.error) { notifyError?.(result.error); return; }
        setCategories(prev => ({
            ...prev,
            [type]: prev[type].filter(c => c.id !== id)
        }));
        // Cascade: remove linked transactions from local state
        if (categoryName) {
            setTransactions(prev => prev.filter(t => t.category !== categoryName));
        }
        success?.('Category and linked records deleted');
    }, [userId, success, notifyError]);

    // ─── SETTINGS (localStorage OK — non-sensitive) ───────────
    const updateSettings = useCallback(async (newSettings) => {
        setSettings(prev => {
            const merged = { ...prev, ...newSettings };
            // Save to localStorage IMMEDIATELY (synchronous) before Supabase
            try { saveToStorage(STORAGE_KEYS.SETTINGS, merged); } catch { /* silent */ }
            return merged;
        });

        // Then sync to Supabase asynchronously
        const result = await SecureAPI.settings.upsert(newSettings, userId);
        if (result.error) {
            console.warn('[FinanceContext] Settings sync failed, local save preserved.');
        }
        success?.('Settings saved');
    }, [userId, success]);

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
        retrySync,       // ← manual re-sync trigger (use in "Retry" UI buttons)
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
        addInvestment, updateInvestment, updateInvestmentPrice, deleteInvestment,
        addBill, updateBill, deleteBill, markBillPaid, unmarkBillPaid,
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
