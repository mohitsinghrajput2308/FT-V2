import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateId, getCurrentMonth } from '../utils/helpers';

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
    const { success, error } = useNotification();

    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [bills, setBills] = useState([]);
    const [categories, setCategories] = useState({ expense: [], income: [] });
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    // Load data from localStorage
    useEffect(() => {
        setTransactions(getFromStorage(STORAGE_KEYS.TRANSACTIONS, []));
        setBudgets(getFromStorage(STORAGE_KEYS.BUDGETS, []));
        setGoals(getFromStorage(STORAGE_KEYS.GOALS, []));
        setInvestments(getFromStorage(STORAGE_KEYS.INVESTMENTS, []));
        setBills(getFromStorage(STORAGE_KEYS.BILLS, []));
        setCategories(getFromStorage(STORAGE_KEYS.CATEGORIES, { expense: [], income: [] }));
        const loadedSettings = getFromStorage(STORAGE_KEYS.SETTINGS, {});
        // Migrate stale India-defaults to global defaults
        let migrated = false;
        if (!loadedSettings.currency || loadedSettings.currency === '₹') { loadedSettings.currency = '$'; migrated = true; }
        if (!loadedSettings.dateFormat || loadedSettings.dateFormat === 'DD/MM/YYYY') { loadedSettings.dateFormat = 'MM/DD/YYYY'; migrated = true; }
        if (migrated) saveToStorage(STORAGE_KEYS.SETTINGS, loadedSettings);
        setSettings(loadedSettings);
        setLoading(false);
    }, []);

    // Filter data by current user
    const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
    const userBudgets = budgets.filter(b => b.userId === currentUser?.id);
    const userGoals = goals.filter(g => g.userId === currentUser?.id);
    const userInvestments = investments.filter(i => i.userId === currentUser?.id);
    const userBills = bills.filter(b => b.userId === currentUser?.id);

    // Transaction CRUD
    const addTransaction = useCallback((data) => {
        const newTransaction = {
            id: generateId(),
            ...data,
            userId: currentUser?.id,
            createdAt: new Date().toISOString()
        };
        const updated = [...transactions, newTransaction];
        setTransactions(updated);
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
        success(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully`);
        return newTransaction;
    }, [transactions, currentUser, success]);

    const updateTransaction = useCallback((id, data) => {
        const updated = transactions.map(t => t.id === id ? { ...t, ...data } : t);
        setTransactions(updated);
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
        success('Transaction updated');
    }, [transactions, success]);

    const deleteTransaction = useCallback((id) => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
        success('Transaction deleted');
    }, [transactions, success]);

    // Budget CRUD
    const addBudget = useCallback((data) => {
        const newBudget = {
            id: generateId(),
            ...data,
            spent: 0,
            month: data.month || getCurrentMonth(),
            userId: currentUser?.id
        };
        const updated = [...budgets, newBudget];
        setBudgets(updated);
        saveToStorage(STORAGE_KEYS.BUDGETS, updated);
        success('Budget created');
        return newBudget;
    }, [budgets, currentUser, success]);

    const updateBudget = useCallback((id, data) => {
        const updated = budgets.map(b => b.id === id ? { ...b, ...data } : b);
        setBudgets(updated);
        saveToStorage(STORAGE_KEYS.BUDGETS, updated);
        success('Budget updated');
    }, [budgets, success]);

    const deleteBudget = useCallback((id) => {
        const updated = budgets.filter(b => b.id !== id);
        setBudgets(updated);
        saveToStorage(STORAGE_KEYS.BUDGETS, updated);
        success('Budget deleted');
    }, [budgets, success]);

    // Goals CRUD
    const addGoal = useCallback((data) => {
        const newGoal = {
            id: generateId(),
            ...data,
            currentAmount: data.currentAmount || 0,
            userId: currentUser?.id,
            createdAt: new Date().toISOString()
        };
        const updated = [...goals, newGoal];
        setGoals(updated);
        saveToStorage(STORAGE_KEYS.GOALS, updated);
        success('Goal created');
        return newGoal;
    }, [goals, currentUser, success]);

    const updateGoal = useCallback((id, data) => {
        const updated = goals.map(g => g.id === id ? { ...g, ...data } : g);
        setGoals(updated);
        saveToStorage(STORAGE_KEYS.GOALS, updated);
        success('Goal updated');
    }, [goals, success]);

    const deleteGoal = useCallback((id) => {
        const updated = goals.filter(g => g.id !== id);
        setGoals(updated);
        saveToStorage(STORAGE_KEYS.GOALS, updated);
        success('Goal deleted');
    }, [goals, success]);

    const addToGoal = useCallback((id, amount) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
            updateGoal(id, { currentAmount: newAmount });
            if (newAmount >= goal.targetAmount) {
                success('🎉 Congratulations! Goal completed!');
            }
        }
    }, [goals, updateGoal, success]);

    // Investments CRUD
    const addInvestment = useCallback((data) => {
        const newInvestment = {
            id: generateId(),
            ...data,
            userId: currentUser?.id
        };
        const updated = [...investments, newInvestment];
        setInvestments(updated);
        saveToStorage(STORAGE_KEYS.INVESTMENTS, updated);
        success('Investment added');
        return newInvestment;
    }, [investments, currentUser, success]);

    const updateInvestment = useCallback((id, data) => {
        const updated = investments.map(i => i.id === id ? { ...i, ...data } : i);
        setInvestments(updated);
        saveToStorage(STORAGE_KEYS.INVESTMENTS, updated);
        success('Investment updated');
    }, [investments, success]);

    const deleteInvestment = useCallback((id) => {
        const updated = investments.filter(i => i.id !== id);
        setInvestments(updated);
        saveToStorage(STORAGE_KEYS.INVESTMENTS, updated);
        success('Investment deleted');
    }, [investments, success]);

    // Bills CRUD
    const addBill = useCallback((data) => {
        const newBill = {
            id: generateId(),
            ...data,
            isPaid: false,
            userId: currentUser?.id
        };
        const updated = [...bills, newBill];
        setBills(updated);
        saveToStorage(STORAGE_KEYS.BILLS, updated);
        success('Bill reminder added');
        return newBill;
    }, [bills, currentUser, success]);

    const updateBill = useCallback((id, data) => {
        const updated = bills.map(b => b.id === id ? { ...b, ...data } : b);
        setBills(updated);
        saveToStorage(STORAGE_KEYS.BILLS, updated);
        success('Bill updated');
    }, [bills, success]);

    const deleteBill = useCallback((id) => {
        const updated = bills.filter(b => b.id !== id);
        setBills(updated);
        saveToStorage(STORAGE_KEYS.BILLS, updated);
        success('Bill deleted');
    }, [bills, success]);

    const markBillPaid = useCallback((id) => {
        updateBill(id, { isPaid: true, paidDate: new Date().toISOString().split('T')[0] });
    }, [updateBill]);

    // Categories CRUD
    const addCategory = useCallback((type, category) => {
        const updated = {
            ...categories,
            [type]: [...(categories[type] || []), { id: generateId(), ...category }]
        };
        setCategories(updated);
        saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
        success('Category added');
    }, [categories, success]);

    const updateCategory = useCallback((type, id, data) => {
        const updated = {
            ...categories,
            [type]: categories[type].map(c => c.id === id ? { ...c, ...data } : c)
        };
        setCategories(updated);
        saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
        success('Category updated');
    }, [categories, success]);

    const deleteCategory = useCallback((type, id) => {
        const updated = {
            ...categories,
            [type]: categories[type].filter(c => c.id !== id)
        };
        setCategories(updated);
        saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
        success('Category deleted');
    }, [categories, success]);

    // Settings
    const updateSettings = useCallback((newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveToStorage(STORAGE_KEYS.SETTINGS, updated);
        success('Settings saved');
    }, [settings, success]);

    // Computed values
    const currentMonth = getCurrentMonth();
    const monthlyIncome = userTransactions
        .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = userTransactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = userTransactions.reduce((sum, t) =>
        t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

    const totalSavings = userGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    const totalInvestmentValue = userInvestments.reduce((sum, i) =>
        sum + (i.currentValue * i.quantity), 0);

    const pendingBillsCount = userBills.filter(b => !b.isPaid).length;

    const value = {
        loading,
        // Data
        transactions: userTransactions,
        budgets: userBudgets,
        goals: userGoals,
        investments: userInvestments,
        bills: userBills,
        categories,
        settings,
        // Transaction methods
        addTransaction,
        updateTransaction,
        deleteTransaction,
        // Budget methods
        addBudget,
        updateBudget,
        deleteBudget,
        // Goal methods
        addGoal,
        updateGoal,
        deleteGoal,
        addToGoal,
        // Investment methods
        addInvestment,
        updateInvestment,
        deleteInvestment,
        // Bill methods
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        // Category methods
        addCategory,
        updateCategory,
        deleteCategory,
        // Settings
        updateSettings,
        // Computed values
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        totalSavings,
        totalInvestmentValue,
        pendingBillsCount,
        currency: settings.currency || '$',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY'
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};

export default FinanceContext;
