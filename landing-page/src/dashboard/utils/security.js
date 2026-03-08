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
        // IMPORTANT: No 'g' flag.
        // Using the 'g' flag with a module-level regex + .test() is a well-known
        // JavaScript footgun: after a successful match, lastIndex is advanced, so
        // the very next .test() call on ANY string starts from the wrong position
        // and may return incorrect results (false-negative XSS detection OR
        // false-positive rejection of completely safe text).
        blacklist: /<script|javascript:|on\w+=/i,
    },
    category: {
        maxLength: 50,
        // IMPORTANT: Pattern allows any char except literal < > { }
        // The * (zero-or-more) is intentional — null/empty check is done BEFORE
        // this pattern, so a post-sanitize empty string correctly maps to
        // the "required" error rather than "invalid format" error.
        pattern: /^[^<>{}]*$/,
    },

    // Stock symbols
    stockSymbol: {
        pattern: /^[A-Z]{1,10}$/,
        maxLength: 10,
    },

    // UUID format (Supabase IDs)
    uuid: {
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    },

    // Goal name
    goalName: {
        minLength: 1,
        maxLength: 100,
    },

    // Bill name
    billName: {
        minLength: 1,
        maxLength: 100,
    },

    // Date (YYYY-MM-DD)
    date: {
        pattern: /^\d{4}-\d{2}-\d{2}$/,
    },

    // Month/Week format (YYYY-MM or YYYY-Wxx) used by budgets
    monthFormat: {
        pattern: /^\d{4}-((0[1-9]|1[0-2])|W(0[1-9]|[1-4][0-9]|5[0-3]))$/,
    },
};

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize string input — strip only genuine attack vectors.
 *
 * PERMANENT DESIGN RULE (do not revert):
 * ─────────────────────────────────────────────────────────────────────────────
 * This function must ONLY remove content that can cause actual harm.
 * We use Supabase's JavaScript SDK which sends PARAMETERIZED queries — the SDK
 * never concatenates raw strings into SQL, so SQL-comment sequences like "--"
 * and C-style comment delimiters "/*" / "*\/" are 100% harmless and must NOT
 * be stripped. Stripping them:
 *   • Changes user-entered text (what they type ≠ what gets saved)
 *   • Breaks names like "Cost -- Benefit" or "Jan/ *Feb* /Mar"
 *   • Can produce an empty string from a valid short name, causing every
 *     length/pattern validator in the app to hard-fail simultaneously
 *     (this IS the root cause of the recurring "all inputs broken" bug).
 *
 * React's JSX already escapes rendered text, so the only genuine XSS vectors
 * that need stripping are raw HTML tags that leak into DB-stored strings.
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return '';

    return input
        // Remove null bytes (binary safety — can corrupt DB text fields)
        .replace(/\0/g, '')
        // Remove complete <script>…</script> blocks (XSS prevention)
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        // Remove any remaining HTML / XML tags (belt-and-suspenders vs XSS)
        .replace(/<[^>]+>/g, '')
        // Trim surrounding whitespace
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

    // Validate name (Income Source / Expense Description)
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Name or Description is required';
    } else {
        sanitizedData.name = sanitizeString(data.name).slice(0, 100);
    }

    // Validate paymentMethod (Expenses)
    if (data.paymentMethod && typeof data.paymentMethod === 'string') {
        sanitizedData.paymentMethod = sanitizeString(data.paymentMethod).slice(0, 50);
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
        if (!sanitizedCategory) {
            errors.category = 'Category is required';
        } else if (!VALIDATION_RULES.category.pattern.test(sanitizedCategory)) {
            errors.category = 'Invalid category format';
        } else {
            sanitizedData.category = sanitizedCategory;
        }
    }

    // Validate description (optional)
    // Note: test against SANITIZED content, not raw — raw test was wrong anyway
    // (sanitizeString already strips the actual dangerous sequences)
    if (data.description) {
        const sanitizedDesc = sanitizeString(data.description).slice(0, VALIDATION_RULES.description.maxLength);
        if (VALIDATION_RULES.description.blacklist.test(sanitizedDesc)) {
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

    // Validate recurring fields
    if (data.is_recurring !== undefined) {
        sanitizedData.is_recurring = Boolean(data.is_recurring);
        if (sanitizedData.is_recurring && data.recurrence) {
            if (['daily', 'weekly', 'monthly', 'yearly'].includes(data.recurrence)) {
                sanitizedData.recurrence = data.recurrence;
            } else {
                errors.recurrence = 'Invalid recurrence type';
            }
            if (data.next_occurrence) {
                const nd = new Date(data.next_occurrence);
                if (!isNaN(nd.getTime())) {
                    sanitizedData.next_occurrence = nd.toISOString().split('T')[0];
                } else {
                    errors.next_occurrence = 'Invalid next occurrence date';
                }
            }
        }
    }

    // Handle customPaymentMethod — resolve it into paymentMethod
    if (data.customPaymentMethod && typeof data.customPaymentMethod === 'string') {
        const custom = sanitizeString(data.customPaymentMethod).slice(0, 50);
        if (custom) sanitizedData.paymentMethod = custom;
    }

    // Reject unexpected fields (whitelist approach)
    const allowedFields = ['amount', 'type', 'category', 'description', 'date', 'is_recurring', 'recurrence', 'next_occurrence', 'name', 'paymentMethod', 'customPaymentMethod', 'userId'];
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

    // Validate name
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.name = 'Investment name is required';
    } else {
        sanitizedData.name = sanitizeString(data.name).slice(0, 100);
    }

    // Validate type — accept predefined types OR any custom non-empty string
    const allowedTypes = ['Stocks', 'Mutual Funds', 'Crypto', 'Gold', 'Real Estate', 'Bonds', 'ETF', 'Other'];
    if (!data.type || typeof data.type !== 'string' || !data.type.trim()) {
        errors.type = 'Valid investment type is required';
    } else if (allowedTypes.includes(data.type)) {
        sanitizedData.type = data.type;
    } else {
        // Custom type string (e.g. user entered "NFT" via the Other → Specify Type field)
        sanitizedData.type = sanitizeString(data.type).slice(0, 50);
    }

    // Validate customType if type is 'Other'
    if (data.type === 'Other' && data.customType) {
        sanitizedData.customType = sanitizeString(data.customType).slice(0, 50);
    }

    // Validate purchase price
    const priceResult = validateAmount(data.purchasePrice);
    if (!priceResult.valid) {
        errors.purchasePrice = priceResult.error;
    } else {
        sanitizedData.purchasePrice = priceResult.value;
    }

    // Validate current value
    const currentResult = validateAmount(data.currentValue);
    if (!currentResult.valid) {
        errors.currentValue = currentResult.error;
    } else {
        sanitizedData.currentValue = currentResult.value;
    }

    // Validate quantity
    const quantity = sanitizeNumber(data.quantity, 0.0001, 1000000);
    if (quantity === null || quantity <= 0) {
        errors.quantity = 'Invalid quantity';
    } else {
        sanitizedData.quantity = quantity;
    }

    // Validate purchase date
    if (data.purchaseDate) {
        const d = new Date(data.purchaseDate);
        if (isNaN(d.getTime())) {
            errors.purchaseDate = 'Invalid purchase date';
        } else {
            sanitizedData.purchaseDate = d.toISOString().split('T')[0];
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

/**
 * Validate UUID format (Supabase record IDs)
 * @param {string} id
 * @returns {{ valid: boolean, error?: string, value?: string }}
 */
export function validateUUID(id) {
    if (!id || typeof id !== 'string') {
        return { valid: false, error: 'ID is required' };
    }
    const trimmed = id.trim();
    if (!VALIDATION_RULES.uuid.pattern.test(trimmed)) {
        return { valid: false, error: 'Invalid ID format' };
    }
    return { valid: true, value: trimmed };
}

/**
 * Validate and sanitize budget data
 * @param {object} data - Budget data object
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateBudgetData(data) {
    const errors = {};
    const sanitizedData = {};

    // Validate amount
    const amountResult = validateAmount(data.amount);
    if (!amountResult.valid) {
        errors.amount = amountResult.error;
    } else {
        sanitizedData.amount = amountResult.value;
    }

    // Validate category
    if (!data.category || typeof data.category !== 'string') {
        errors.category = 'Category is required';
    } else {
        const sanitizedCategory = sanitizeString(data.category).slice(0, VALIDATION_RULES.category.maxLength);
        if (!sanitizedCategory) {
            errors.category = 'Category is required';
        } else if (!VALIDATION_RULES.category.pattern.test(sanitizedCategory)) {
            errors.category = 'Invalid category format';
        } else {
            sanitizedData.category = sanitizedCategory;
        }
    }

    // Validate month (YYYY-MM or YYYY-Wxx format)
    if (data.month) {
        const month = String(data.month).trim();
        if (!VALIDATION_RULES.monthFormat.pattern.test(month)) {
            errors.month = 'Invalid period format (expected YYYY-MM or YYYY-Wxx)';
        } else {
            sanitizedData.month = month;
        }
    }

    // Validate spent (optional)
    if (data.spent !== undefined) {
        const spentVal = parseFloat(data.spent);
        if (!isNaN(spentVal) && spentVal >= 0) {
            sanitizedData.spent = Math.round(spentVal * 100) / 100;
        }
    }

    // Whitelist check
    const allowedFields = ['amount', 'category', 'month', 'userId', 'spent'];
    Object.keys(data).forEach(key => {
        if (!allowedFields.includes(key)) {
            console.warn(`[SECURITY] Budget: unexpected field rejected: ${key}`);
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

/**
 * Validate and sanitize goal data
 * @param {object} data - Goal data object
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateGoalData(data) {
    const errors = {};
    const sanitizedData = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Goal name is required';
    } else {
        const name = sanitizeString(data.name).slice(0, VALIDATION_RULES.goalName.maxLength);
        if (name.length < VALIDATION_RULES.goalName.minLength) {
            errors.name = 'Goal name is too short';
        } else {
            sanitizedData.name = name;
        }
    }

    // Validate target amount
    const targetResult = validateAmount(data.targetAmount);
    if (!targetResult.valid) {
        errors.targetAmount = targetResult.error;
    } else {
        sanitizedData.targetAmount = targetResult.value;
    }

    // Validate current amount (optional, defaults to 0)
    if (data.currentAmount !== undefined) {
        const currentResult = sanitizeAmount(data.currentAmount);
        if (currentResult === null || currentResult < 0) {
            errors.currentAmount = 'Invalid current amount';
        } else {
            sanitizedData.currentAmount = currentResult;
        }
    } else {
        sanitizedData.currentAmount = 0;
    }

    // Validate deadline (optional)
    if (data.deadline) {
        const d = new Date(data.deadline);
        if (isNaN(d.getTime())) {
            errors.deadline = 'Invalid deadline date';
        } else {
            sanitizedData.deadline = d.toISOString().split('T')[0];
        }
    }

    // Validate category (optional)
    if (data.category) {
        sanitizedData.category = sanitizeString(data.category).slice(0, VALIDATION_RULES.category.maxLength);
    }

    // Validate priority (optional)
    if (data.priority !== undefined) {
        if (['High', 'Medium', 'Low'].includes(data.priority)) {
            sanitizedData.priority = data.priority;
        } else {
            sanitizedData.priority = 'Medium';
        }
    }

    // Validate description (optional)
    if (data.description !== undefined && data.description !== null) {
        const desc = sanitizeString(String(data.description)).slice(0, 500);
        if (!/[<>{}]/.test(desc)) {
            sanitizedData.description = desc || null;
        }
    }

    const allowedFields = ['name', 'targetAmount', 'currentAmount', 'deadline', 'category', 'userId', 'priority', 'description'];
    Object.keys(data).forEach(key => {
        if (!allowedFields.includes(key)) {
            console.warn(`[SECURITY] Goal: unexpected field rejected: ${key}`);
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

/**
 * Validate and sanitize bill data
 * @param {object} data - Bill data object
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateBillData(data) {
    const errors = {};
    const sanitizedData = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Bill name is required';
    } else {
        const name = sanitizeString(data.name).slice(0, VALIDATION_RULES.billName.maxLength);
        if (name.length < VALIDATION_RULES.billName.minLength) {
            errors.name = 'Bill name is too short';
        } else {
            sanitizedData.name = name;
        }
    }

    // Validate amount
    const amountResult = validateAmount(data.amount);
    if (!amountResult.valid) {
        errors.amount = amountResult.error;
    } else {
        sanitizedData.amount = amountResult.value;
    }

    // Validate due date
    if (!data.dueDate) {
        errors.dueDate = 'Due date is required';
    } else {
        const d = new Date(data.dueDate);
        if (isNaN(d.getTime())) {
            errors.dueDate = 'Invalid due date';
        } else {
            sanitizedData.dueDate = d.toISOString().split('T')[0];
        }
    }

    // Validate category (optional)
    if (data.category) {
        sanitizedData.category = sanitizeString(data.category).slice(0, VALIDATION_RULES.category.maxLength);
    }

    // Boolean fields
    if (data.isPaid !== undefined) sanitizedData.isPaid = Boolean(data.isPaid);
    if (data.isRecurring !== undefined) sanitizedData.isRecurring = Boolean(data.isRecurring);
    if (data.recurrence !== undefined) {
        if (['weekly', 'monthly', 'yearly'].includes(data.recurrence)) {
            sanitizedData.recurrence = data.recurrence;
        } else if (data.recurrence !== null) {
            errors.recurrence = 'Invalid recurrence type';
        }
    }

    // Recurring label (UI value like 'Monthly', 'Quarterly', etc.)
    if (data.recurring) {
        sanitizedData.recurring = sanitizeString(data.recurring).slice(0, 20);
    }

    // Priority (optional)
    if (data.priority) {
        if (['High', 'Medium', 'Low'].includes(data.priority)) {
            sanitizedData.priority = data.priority;
        } else {
            sanitizedData.priority = 'Medium';
        }
    }

    // Paid date (optional)
    if (data.paidDate) {
        const pd = new Date(data.paidDate);
        if (!isNaN(pd.getTime())) {
            sanitizedData.paidDate = pd.toISOString().split('T')[0];
        }
    }

    const allowedFields = ['name', 'amount', 'dueDate', 'category', 'isPaid', 'paidDate', 'isRecurring', 'recurrence', 'recurring', 'priority', 'userId'];
    Object.keys(data).forEach(key => {
        if (!allowedFields.includes(key)) {
            console.warn(`[SECURITY] Bill: unexpected field rejected: ${key}`);
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        data: sanitizedData,
    };
}

/**
 * Validate category data
 * @param {string} type - 'income' or 'expense'
 * @param {object} data - { name, icon?, color? }
 * @returns {{ valid: boolean, errors?: object, data?: object }}
 */
export function validateCategoryData(type, data) {
    const errors = {};
    const sanitizedData = {};

    // Validate type
    if (!['income', 'expense'].includes(type)) {
        errors.type = 'Invalid category type';
    } else {
        sanitizedData.type = type;
    }

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Category name is required';
    } else {
        const name = sanitizeString(data.name).slice(0, VALIDATION_RULES.category.maxLength);
        if (!name) {
            errors.name = 'Category name is required';
        } else if (!VALIDATION_RULES.category.pattern.test(name)) {
            errors.name = 'Invalid category name format';
        } else {
            sanitizedData.name = name;
        }
    }

    // Icon (optional, sanitize)
    if (data.icon) sanitizedData.icon = sanitizeString(data.icon).slice(0, 10);

    // Color (optional, validate hex/named color)
    if (data.color) {
        const color = String(data.color).trim();
        if (/^#[0-9a-fA-F]{3,8}$/.test(color) || /^[a-zA-Z]+$/.test(color)) {
            sanitizedData.color = color;
        }
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
