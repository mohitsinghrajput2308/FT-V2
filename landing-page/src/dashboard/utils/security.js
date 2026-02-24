/**
 * Security Utilities - Input Validation & Sanitization
 * Following OWASP Best Practices
 */

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const VALIDATION_RULES = {
    // User authentication
    email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        minLength: 5,
    },
    password: {
        minLength: 8,
        maxLength: 128,
        // Must contain: uppercase, lowercase, number, special char
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    username: {
        pattern: /^[a-zA-Z0-9_-]+$/,
        minLength: 3,
        maxLength: 30,
    },

    // Financial data
    amount: {
        min: 0.01,
        max: 999999999.99,
        decimals: 2,
    },
    description: {
        maxLength: 500,
        // Prevent XSS: no script tags or event handlers
        blacklist: /<script|javascript:|on\w+=/gi,
    },
    category: {
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s&-]+$/,
    },

    // Stock symbols
    stockSymbol: {
        pattern: /^[A-Z]{1,10}$/,
        maxLength: 10,
    },
};

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize string input - Remove dangerous characters
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return '';

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Encode HTML entities to prevent XSS
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove potential SQL injection patterns
        .replace(/(['";])/g, '')
        // Trim whitespace
        .trim();
}

/**
 * Sanitize email input
 * @param {string} email - Raw email input
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim().slice(0, VALIDATION_RULES.email.maxLength);
}

/**
 * Sanitize numeric input
 * @param {any} value - Raw input
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number|null} - Sanitized number or null if invalid
 */
export function sanitizeNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return null;
    return Math.min(Math.max(num, min), max);
}

/**
 * Sanitize amount (financial values)
 * @param {any} amount - Raw amount input
 * @returns {number|null} - Sanitized amount or null
 */
export function sanitizeAmount(amount) {
    const num = sanitizeNumber(amount, VALIDATION_RULES.amount.min, VALIDATION_RULES.amount.max);
    if (num === null) return null;
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }

    const sanitized = sanitizeEmail(email);

    if (sanitized.length < VALIDATION_RULES.email.minLength) {
        return { valid: false, error: 'Email is too short' };
    }

    if (sanitized.length > VALIDATION_RULES.email.maxLength) {
        return { valid: false, error: 'Email is too long' };
    }

    if (!VALIDATION_RULES.email.pattern.test(sanitized)) {
        return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true, value: sanitized };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < VALIDATION_RULES.password.minLength) {
        return { valid: false, error: `Password must be at least ${VALIDATION_RULES.password.minLength} characters` };
    }

    if (password.length > VALIDATION_RULES.password.maxLength) {
        return { valid: false, error: 'Password is too long' };
    }

    // Check complexity (optional - can be less strict for UX)
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain a lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain an uppercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, error: 'Password must contain a number' };
    }

    return { valid: true };
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }

    const sanitized = sanitizeString(username).slice(0, VALIDATION_RULES.username.maxLength);

    if (sanitized.length < VALIDATION_RULES.username.minLength) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (!VALIDATION_RULES.username.pattern.test(sanitized)) {
        return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    return { valid: true, value: sanitized };
}

/**
 * Validate financial amount
 * @param {any} amount - Amount to validate
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
export function validateAmount(amount) {
    const sanitized = sanitizeAmount(amount);

    if (sanitized === null) {
        return { valid: false, error: 'Invalid amount' };
    }

    if (sanitized < VALIDATION_RULES.amount.min) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (sanitized > VALIDATION_RULES.amount.max) {
        return { valid: false, error: 'Amount exceeds maximum limit' };
    }

    return { valid: true, value: sanitized };
}

/**
 * Validate and sanitize transaction data
 * @param {object} data - Transaction data object
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateTransactionData(data) {
    const errors = {};
    const sanitizedData = {};

    // Validate amount
    const amountResult = validateAmount(data.amount);
    if (!amountResult.valid) {
        errors.amount = amountResult.error;
    } else {
        sanitizedData.amount = amountResult.value;
    }

    // Validate type
    if (!['income', 'expense'].includes(data.type)) {
        errors.type = 'Invalid transaction type';
    } else {
        sanitizedData.type = data.type;
    }

    // Validate category
    if (!data.category || typeof data.category !== 'string') {
        errors.category = 'Category is required';
    } else {
        const sanitizedCategory = sanitizeString(data.category).slice(0, VALIDATION_RULES.category.maxLength);
        if (!VALIDATION_RULES.category.pattern.test(sanitizedCategory)) {
            errors.category = 'Invalid category format';
        } else {
            sanitizedData.category = sanitizedCategory;
        }
    }

    // Validate description (optional)
    if (data.description) {
        const sanitizedDesc = sanitizeString(data.description).slice(0, VALIDATION_RULES.description.maxLength);
        if (VALIDATION_RULES.description.blacklist.test(data.description)) {
            errors.description = 'Description contains invalid content';
        } else {
            sanitizedData.description = sanitizedDesc;
        }
    }

    // Validate date
    if (data.date) {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
            errors.date = 'Invalid date';
        } else {
            sanitizedData.date = date.toISOString().split('T')[0];
        }
    }

    // Reject unexpected fields (whitelist approach)
    const allowedFields = ['amount', 'type', 'category', 'description', 'date'];
    Object.keys(data).forEach(key => {
        if (!allowedFields.includes(key)) {
            console.warn(`[SECURITY] Unexpected field rejected: ${key}`);
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

/**
 * Validate investment data
 * @param {object} data - Investment data object
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateInvestmentData(data) {
    const errors = {};
    const sanitizedData = {};

    // Validate stock symbol
    if (!data.symbol || typeof data.symbol !== 'string') {
        errors.symbol = 'Stock symbol is required';
    } else {
        const symbol = data.symbol.toUpperCase().trim();
        if (!VALIDATION_RULES.stockSymbol.pattern.test(symbol)) {
            errors.symbol = 'Invalid stock symbol format';
        } else {
            sanitizedData.symbol = symbol;
        }
    }

    // Validate quantity
    const quantity = sanitizeNumber(data.quantity, 0.0001, 1000000);
    if (quantity === null || quantity <= 0) {
        errors.quantity = 'Invalid quantity';
    } else {
        sanitizedData.quantity = quantity;
    }

    // Validate purchase price
    const priceResult = validateAmount(data.purchasePrice);
    if (!priceResult.valid) {
        errors.purchasePrice = priceResult.error;
    } else {
        sanitizedData.purchasePrice = priceResult.value;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

// ============================================
// XSS PROTECTION
// ============================================

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Potentially unsafe string
 * @returns {string} - Safe escaped string
 */
export function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Check for potential XSS patterns
 * @param {string} input - Input to check
 * @returns {boolean} - True if potentially dangerous
 */
export function containsXSS(input) {
    if (typeof input !== 'string') return false;
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:/gi,
        /vbscript:/gi,
    ];
    return xssPatterns.some(pattern => pattern.test(input));
}
