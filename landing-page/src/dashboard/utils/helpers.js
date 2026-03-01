/**
 * Helper utility functions for the Finance Tracker application
 */

/**
 * Generate a unique ID using timestamp and random string
 * @returns {string} Unique identifier
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Format currency with the specified symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol ($, €, £, ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return `${currency}0`;
    }

    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    return amount < 0 ? `-${currency}${formatted}` : `${currency}${formatted}`;
};

/**
 * Format date according to the specified format
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return `${day}/${month}/${year}`;
    }
};

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();
    const diffTime = now - d;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    const percentage = (value / total) * 100;
    return Math.min(Math.max(percentage, 0), 100);
};

/**
 * Get date range for filtering
 * @param {string} range - Range type (today, week, month, year, all)
 * @returns {Object} Start and end dates
 */
export const getDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return {
                start: weekStart,
                end: now
            };
        case 'month':
            return {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: now
            };
        case 'year':
            return {
                start: new Date(now.getFullYear(), 0, 1),
                end: now
            };
        case 'all':
        default:
            return {
                start: new Date(0),
                end: now
            };
    }
};

/**
 * Get the current month in YYYY-MM format
 * @returns {string} Current month string
 */
export const getCurrentMonth = () => {
    return new Date().toISOString().slice(0, 7);
};

/**
 * Get month name from date
 * @param {string|Date} date - Date
 * @returns {string} Month name
 */
export const getMonthName = (date) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const d = new Date(date);
    return months[d.getMonth()];
};

/**
 * Get short month name from date
 * @param {string|Date} date - Date
 * @returns {string} Short month name
 */
export const getShortMonthName = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return months[d.getMonth()];
};

/**
 * Group transactions by category
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Transactions grouped by category
 */
export const groupByCategory = (transactions) => {
    return transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        if (!acc[category]) {
            acc[category] = {
                total: 0,
                count: 0,
                transactions: []
            };
        }
        acc[category].total += transaction.amount;
        acc[category].count += 1;
        acc[category].transactions.push(transaction);
        return acc;
    }, {});
};

/**
 * Group transactions by month
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Transactions grouped by month
 */
export const groupByMonth = (transactions) => {
    return transactions.reduce((acc, transaction) => {
        const month = transaction.date.slice(0, 7);
        if (!acc[month]) {
            acc[month] = {
                income: 0,
                expense: 0,
                transactions: []
            };
        }
        if (transaction.type === 'income') {
            acc[month].income += transaction.amount;
        } else {
            acc[month].expense += transaction.amount;
        }
        acc[month].transactions.push(transaction);
        return acc;
    }, {});
};

/**
 * Calculate financial health score (0-100)
 * @param {Object} data - Financial data
 * @returns {number} Health score
 */
export const calculateFinancialHealthScore = (data) => {
    const { income, expenses, savings, budgetUtilization, goalsProgress } = data;

    let score = 50; // Base score

    // Savings ratio (target: 20%+)
    const savingsRatio = income > 0 ? (savings / income) * 100 : 0;
    if (savingsRatio >= 30) score += 20;
    else if (savingsRatio >= 20) score += 15;
    else if (savingsRatio >= 10) score += 10;
    else if (savingsRatio >= 5) score += 5;
    else if (savingsRatio < 0) score -= 10;

    // Budget adherence
    if (budgetUtilization <= 80) score += 15;
    else if (budgetUtilization <= 90) score += 10;
    else if (budgetUtilization <= 100) score += 5;
    else score -= 10;

    // Goals progress
    if (goalsProgress >= 75) score += 15;
    else if (goalsProgress >= 50) score += 10;
    else if (goalsProgress >= 25) score += 5;

    return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * Get color based on budget utilization percentage
 * @param {number} percentage - Utilization percentage
 * @returns {string} Color class
 */
export const getBudgetColor = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
};

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects
 * @param {Array} headers - Column headers
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers) => {
    if (!data || data.length === 0) return '';

    const headerRow = headers.join(',');
    const dataRows = data.map(item =>
        headers.map(header => {
            const value = item[header] ?? '';
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Download file with content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (content, filename, type = 'text/csv') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Calculate days until date
 * @param {string|Date} date - Target date
 * @returns {number} Days until date (negative if past)
 */
export const daysUntil = (date) => {
    const target = new Date(date);
    const now = new Date();
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Sort array by date
 * @param {Array} arr - Array to sort
 * @param {string} key - Date key
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} Sorted array
 */
export const sortByDate = (arr, key = 'date', order = 'desc') => {
    return [...arr].sort((a, b) => {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Transactions to filter
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered transactions
 */
export const filterByDateRange = (transactions, startDate, endDate) => {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });
};

/**
 * Calculate the next occurrence date based on frequency
 * @param {string|Date} baseDate - Starting date
 * @param {string} frequency - 'daily', 'weekly', 'monthly', 'yearly'
 * @returns {string} - Date string in YYYY-MM-DD
 */
export const calculateNextOccurrence = (baseDate, frequency) => {
    const date = new Date(baseDate);
    if (isNaN(date.getTime())) return null;

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            return null;
    }

    return date.toISOString().split('T')[0];
};
