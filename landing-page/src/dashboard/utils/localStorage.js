/**
 * localStorage utility functions for data persistence
 */

import { loadSampleData } from '../data/sampleData';

export const STORAGE_KEYS = {
    USERS: 'finance_users',
    CURRENT_USER: 'finance_currentUser',
    TRANSACTIONS: 'finance_transactions',
    BUDGETS: 'finance_budgets',
    GOALS: 'finance_goals',
    INVESTMENTS: 'finance_investments',
    BILLS: 'finance_bills',
    CATEGORIES: 'finance_categories',
    THEME: 'finance_theme',
    SETTINGS: 'finance_settings'
};

export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage (${key}):`, error);
        return defaultValue;
    }
};

export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving localStorage (${key}):`, error);
        return false;
    }
};

export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing localStorage (${key}):`, error);
    }
};

export const clearAllStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => removeFromStorage(key));
};

export const initializeWithSampleData = (force = false) => {
    const sampleData = loadSampleData();

    if (force || !getFromStorage(STORAGE_KEYS.USERS)) {
        saveToStorage(STORAGE_KEYS.USERS, sampleData.users);
    }
    if (force || !getFromStorage(STORAGE_KEYS.TRANSACTIONS)) {
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, sampleData.transactions);
    }
    if (force || !getFromStorage(STORAGE_KEYS.GOALS)) {
        saveToStorage(STORAGE_KEYS.GOALS, sampleData.goals);
    }
    if (force || !getFromStorage(STORAGE_KEYS.INVESTMENTS)) {
        saveToStorage(STORAGE_KEYS.INVESTMENTS, sampleData.investments);
    }
    if (force || !getFromStorage(STORAGE_KEYS.BILLS)) {
        saveToStorage(STORAGE_KEYS.BILLS, sampleData.bills);
    }
    if (force || !getFromStorage(STORAGE_KEYS.BUDGETS)) {
        saveToStorage(STORAGE_KEYS.BUDGETS, sampleData.budgets);
    }
    if (force || !getFromStorage(STORAGE_KEYS.CATEGORIES)) {
        saveToStorage(STORAGE_KEYS.CATEGORIES, sampleData.categories);
    }
    if (force || !getFromStorage(STORAGE_KEYS.SETTINGS)) {
        saveToStorage(STORAGE_KEYS.SETTINGS, sampleData.settings);
    }
};

export const isAppInitialized = () => !!getFromStorage(STORAGE_KEYS.USERS);

export const exportAllData = () => ({
    users: getFromStorage(STORAGE_KEYS.USERS, []),
    transactions: getFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
    budgets: getFromStorage(STORAGE_KEYS.BUDGETS, []),
    goals: getFromStorage(STORAGE_KEYS.GOALS, []),
    investments: getFromStorage(STORAGE_KEYS.INVESTMENTS, []),
    bills: getFromStorage(STORAGE_KEYS.BILLS, []),
    categories: getFromStorage(STORAGE_KEYS.CATEGORIES, {}),
    settings: getFromStorage(STORAGE_KEYS.SETTINGS, {}),
    exportedAt: new Date().toISOString()
});

export const importData = (data) => {
    try {
        if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
        if (data.transactions) saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
        if (data.budgets) saveToStorage(STORAGE_KEYS.BUDGETS, data.budgets);
        if (data.goals) saveToStorage(STORAGE_KEYS.GOALS, data.goals);
        if (data.investments) saveToStorage(STORAGE_KEYS.INVESTMENTS, data.investments);
        if (data.bills) saveToStorage(STORAGE_KEYS.BILLS, data.bills);
        if (data.categories) saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories);
        if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
};
