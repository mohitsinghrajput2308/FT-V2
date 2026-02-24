/**
 * Sample data for the Finance Tracker application
 * This file is now empty - no sample data
 */

// Sample Users - Empty
export const sampleUsers = [];

// Sample Transactions (Income & Expenses) - Empty
export const sampleTransactions = [];

// Sample Savings Goals - Empty
export const sampleGoals = [];

// Sample Investments - Empty
export const sampleInvestments = [];

// Sample Bills - Empty
export const sampleBills = [];

// Sample Budget Data - Empty
export const sampleBudgets = [];

// Default Categories (keep these for the app to work)
export const defaultCategories = {
    expense: [
        { id: 'cat_1', name: 'Food', color: '#ef4444', icon: 'Utensils' },
        { id: 'cat_2', name: 'Transport', color: '#f59e0b', icon: 'Car' },
        { id: 'cat_3', name: 'Entertainment', color: '#8b5cf6', icon: 'Gamepad2' },
        { id: 'cat_4', name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
        { id: 'cat_5', name: 'Bills', color: '#6366f1', icon: 'Receipt' },
        { id: 'cat_6', name: 'Healthcare', color: '#10b981', icon: 'Heart' },
        { id: 'cat_7', name: 'Education', color: '#3b82f6', icon: 'GraduationCap' },
        { id: 'cat_8', name: 'Other', color: '#6b7280', icon: 'MoreHorizontal' }
    ],
    income: [
        { id: 'inc_1', name: 'Salary', color: '#10b981', icon: 'Briefcase' },
        { id: 'inc_2', name: 'Freelance', color: '#3b82f6', icon: 'Laptop' },
        { id: 'inc_3', name: 'Business', color: '#8b5cf6', icon: 'Building' },
        { id: 'inc_4', name: 'Investment Returns', color: '#f59e0b', icon: 'TrendingUp' },
        { id: 'inc_5', name: 'Gift', color: '#ec4899', icon: 'Gift' },
        { id: 'inc_6', name: 'Other', color: '#6b7280', icon: 'MoreHorizontal' }
    ]
};

// Default Settings
export const defaultSettings = {
    currency: '$',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
        email: true,
        push: true,
        billReminders: true,
        budgetAlerts: true
    },
    theme: 'light'
};

// Export all sample data - now returns empty arrays
export const loadSampleData = () => {
    return {
        users: sampleUsers,
        transactions: sampleTransactions,
        goals: sampleGoals,
        investments: sampleInvestments,
        bills: sampleBills,
        budgets: sampleBudgets,
        categories: defaultCategories,
        settings: defaultSettings
    };
};
