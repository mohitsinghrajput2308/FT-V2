/**
 * localStorage — SETTINGS ONLY
 *
 * SECURITY POLICY:
 *   Financial data (transactions, budgets, goals, investments, bills, categories)
 *   is stored EXCLUSIVELY in Supabase via secureApi → supabaseService.
 *
 *   This module is retained ONLY for non-sensitive user preferences:
 *     - currency symbol (e.g. '$', '€', '₹')
 *     - date format (e.g. 'MM/DD/YYYY')
 *     - UI theme preference
 *
 *   These are cached locally for instant UI rendering and synced to Supabase
 *   as the source of truth. No financial data touches localStorage.
 */

export const STORAGE_KEYS = {
    THEME: 'finance_theme',
    SETTINGS: 'finance_settings',
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

/**
 * Clear all app-related localStorage keys.
 * Called on sign-out to prevent stale data.
 */
export const clearAllStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => removeFromStorage(key));
};
