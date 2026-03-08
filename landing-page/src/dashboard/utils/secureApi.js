/**
 * Secure API Gateway
 *
 * THE SINGLE ENTRY POINT for all financial data operations.
 * Every mutation flows through this layer before reaching Supabase:
 *
 *   Dashboard → FinanceContext → secureApi.js → supabaseService.js → Supabase
 *                                    ↑
 *                          validation + rate limiting + sanitization
 *
 * Security features:
 *   ✓ Input validation & sanitization (OWASP)
 *   ✓ Client-side rate limiting (per-user, per-action)
 *   ✓ UUID validation for all record IDs
 *   ✓ Whitelist-based field filtering (rejects unexpected fields)
 *   ✓ Structured error responses (never leak internals)
 *   ✓ Plan-based item limits (Free: 2, Pro: 5, Business: unlimited)
 *
 * Following OWASP Best Practices
 */

// Plan-based item limits (budgets / goals / bills)
const PLAN_ITEM_LIMITS = { free: 2, pro: 5 }; // 'business' is not present → unlimited

import { config } from './config';
import { mutationRateLimiter, apiRateLimiter, createRateLimitResponse } from './rateLimit';
import {
    validateTransactionData,
    validateInvestmentData,
    validateBudgetData,
    validateGoalData,
    validateBillData,
    validateCategoryData,
    validateUUID,
    sanitizeString,
} from './security';

import {
    TransactionService,
    BudgetService,
    GoalService,
    InvestmentService,
    BillService,
    CategoryService,
    SettingsService,
} from '../services/supabaseService';

// ============================================
// INTERNAL: Rate limit check wrapper
// ============================================

function checkRate(userId, action, limiter = mutationRateLimiter) {
    if (!config.security.enableRateLimiting) return null;
    const result = limiter.checkLimit(userId || 'anonymous', action);
    if (!result.allowed) {
        console.warn(`[SECURITY] Rate limit exceeded: ${action} by ${userId}`);
        return createRateLimitResponse(result.retryAfter);
    }
    return null; // allowed
}

/**
 * Create a standardised error response matching what FinanceContext expects.
 * { error: string }
 */
function validationError(message, details) {
    console.warn(`[SECURITY] Validation failed: ${message}`, details);
    return { error: message, details };
}

// ============================================
// SECURE TRANSACTION API
// ============================================

export const SecureTransactionAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'transactions.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return TransactionService.getAll();
    },

    async create(data, userId) {
        // Rate limit
        const blocked = checkRate(userId, 'transactions.create');
        if (blocked) return { error: blocked.error.message };

        // Validate
        const validation = validateTransactionData(data);
        if (!validation.valid) {
            return validationError('Invalid transaction data', validation.errors);
        }

        // Pass validated + sanitized data to Supabase layer
        return TransactionService.create({ ...validation.data, userId });
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'transactions.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        // Partial validation — only validate provided fields
        const sanitized = {};
        if (data.type !== undefined) {
            if (!['income', 'expense'].includes(data.type)) return validationError('Invalid transaction type');
            sanitized.type = data.type;
        }
        if (data.amount !== undefined) {
            const num = parseFloat(data.amount);
            if (isNaN(num) || num <= 0) return validationError('Invalid amount');
            sanitized.amount = Math.round(num * 100) / 100;
        }
        if (data.category !== undefined) {
            sanitized.category = sanitizeString(data.category).slice(0, 50);
        }
        if (data.name !== undefined) {
            sanitized.name = sanitizeString(data.name).slice(0, 100);
        }
        if (data.paymentMethod !== undefined) {
            sanitized.paymentMethod = sanitizeString(data.paymentMethod).slice(0, 50);
        }
        if (data.description !== undefined) {
            sanitized.description = sanitizeString(data.description).slice(0, 500);
        }
        if (data.date !== undefined) {
            const d = new Date(data.date);
            if (isNaN(d.getTime())) return validationError('Invalid date');
            sanitized.date = d.toISOString().split('T')[0];
        }

        return TransactionService.update(idCheck.value, sanitized);
    },

    async delete(id, userId) {
        const blocked = checkRate(userId, 'transactions.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        return TransactionService.delete(idCheck.value);
    },
};

// ============================================
// SECURE BUDGET API
// ============================================

export const SecureBudgetAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'budgets.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return BudgetService.getAll();
    },

    async create(data, userId, limitInfo = null) {
        const blocked = checkRate(userId, 'budgets.create');
        if (blocked) return { error: blocked.error.message };

        // Plan-based limit enforcement
        if (limitInfo) {
            const { plan = 'free', existingCount = 0 } = limitInfo;
            const limit = PLAN_ITEM_LIMITS[plan];
            if (limit !== undefined && existingCount >= limit) {
                return { error: `You have reached the maximum limit for your current plan. Delete an existing budget or upgrade your plan to create more.` };
            }
        }

        const validation = validateBudgetData(data);
        if (!validation.valid) return validationError('Invalid budget data', validation.errors);

        return BudgetService.create({ ...validation.data, userId });
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'budgets.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        // Partial field validation
        const sanitized = {};
        if (data.category !== undefined) sanitized.category = sanitizeString(data.category).slice(0, 50);
        if (data.amount !== undefined) {
            const num = parseFloat(data.amount);
            if (isNaN(num) || num < 0) return validationError('Invalid amount');
            sanitized.amount = Math.round(num * 100) / 100;
        }
        if (data.month !== undefined) sanitized.month = data.month;
        if (data.spent !== undefined) {
            const num = parseFloat(data.spent);
            if (!isNaN(num) && num >= 0) sanitized.spent = Math.round(num * 100) / 100;
        }

        return BudgetService.update(idCheck.value, sanitized);
    },

    async delete(id, userId) {
        const blocked = checkRate(userId, 'budgets.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        return BudgetService.delete(idCheck.value);
    },
};

// ============================================
// SECURE GOAL API
// ============================================

export const SecureGoalAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'goals.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return GoalService.getAll();
    },

    async create(data, userId, limitInfo = null) {
        const blocked = checkRate(userId, 'goals.create');
        if (blocked) return { error: blocked.error.message };

        // Plan-based limit enforcement
        if (limitInfo) {
            const { plan = 'free', existingCount = 0 } = limitInfo;
            const limit = PLAN_ITEM_LIMITS[plan];
            if (limit !== undefined && existingCount >= limit) {
                return { error: `You have reached the maximum limit for your current plan. Delete an existing goal or upgrade your plan to create more.` };
            }
        }

        const validation = validateGoalData(data);
        if (!validation.valid) return validationError('Invalid goal data', validation.errors);

        return GoalService.create({ ...validation.data, userId });
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'goals.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        const sanitized = {};
        if (data.name !== undefined) sanitized.name = sanitizeString(data.name).slice(0, 100);
        if (data.targetAmount !== undefined) {
            const num = parseFloat(data.targetAmount);
            if (isNaN(num) || num <= 0) return validationError('Invalid target amount');
            sanitized.targetAmount = Math.round(num * 100) / 100;
        }
        if (data.currentAmount !== undefined) {
            const num = parseFloat(data.currentAmount);
            if (isNaN(num) || num < 0) return validationError('Invalid current amount');
            sanitized.currentAmount = Math.round(num * 100) / 100;
        }
        if (data.deadline !== undefined) sanitized.deadline = data.deadline;
        if (data.category !== undefined) sanitized.category = sanitizeString(data.category).slice(0, 50);
        if (data.priority !== undefined) {
            const allowed = ['High', 'Medium', 'Low'];
            sanitized.priority = allowed.includes(data.priority) ? data.priority : 'Medium';
        }
        if (data.description !== undefined) sanitized.description = sanitizeString(data.description).slice(0, 500);

        return GoalService.update(idCheck.value, sanitized);
    },

    async delete(id, userId) {
        const blocked = checkRate(userId, 'goals.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        return GoalService.delete(idCheck.value);
    },
};

// ============================================
// SECURE INVESTMENT API
// ============================================

export const SecureInvestmentAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'investments.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return InvestmentService.getAll();
    },

    async create(data, userId) {
        const blocked = checkRate(userId, 'investments.create');
        if (blocked) return { error: blocked.error.message };

        const validation = validateInvestmentData(data);
        if (!validation.valid) return validationError('Invalid investment data', validation.errors);

        return InvestmentService.create({ ...validation.data, userId });
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'investments.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        const sanitized = {};
        if (data.name !== undefined) {
            sanitized.name = sanitizeString(data.name).slice(0, 100);
        }
        if (data.type !== undefined) {
            sanitized.type = data.type;
        }
        if (data.quantity !== undefined) {
            const num = parseFloat(data.quantity);
            if (isNaN(num) || num <= 0) return validationError('Invalid quantity');
            sanitized.quantity = num;
        }
        if (data.purchasePrice !== undefined || data.buyPrice !== undefined) {
            const num = parseFloat(data.purchasePrice || data.buyPrice);
            if (isNaN(num) || num < 0) return validationError('Invalid purchase price');
            sanitized.purchasePrice = Math.round(num * 100) / 100;
        }
        if (data.currentValue !== undefined || data.currentPrice !== undefined) {
            const num = parseFloat(data.currentValue || data.currentPrice);
            if (isNaN(num) || num < 0) return validationError('Invalid current price');
            sanitized.currentValue = Math.round(num * 100) / 100;
        }
        if (data.purchaseDate || data.date) sanitized.purchaseDate = data.purchaseDate || data.date;

        return InvestmentService.update(idCheck.value, sanitized);
    },

    async delete(id, userId) {
        const blocked = checkRate(userId, 'investments.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        return InvestmentService.delete(idCheck.value);
    },
};

// ============================================
// SECURE BILL API
// ============================================

export const SecureBillAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'bills.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return BillService.getAll();
    },

    async create(data, userId, limitInfo = null) {
        const blocked = checkRate(userId, 'bills.create');
        if (blocked) return { error: blocked.error.message };

        // Plan-based limit enforcement
        if (limitInfo) {
            const { plan = 'free', existingCount = 0 } = limitInfo;
            const limit = PLAN_ITEM_LIMITS[plan];
            if (limit !== undefined && existingCount >= limit) {
                return { error: `You have reached the maximum limit for your current plan. Delete an existing bill or upgrade your plan to create more.` };
            }
        }

        const validation = validateBillData(data);
        if (!validation.valid) return validationError('Invalid bill data', validation.errors);

        return BillService.create({ ...validation.data, userId });
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'bills.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        const sanitized = {};
        if (data.name !== undefined) sanitized.name = sanitizeString(data.name).slice(0, 100);
        if (data.amount !== undefined) {
            const num = parseFloat(data.amount);
            if (isNaN(num) || num <= 0) return validationError('Invalid amount');
            sanitized.amount = Math.round(num * 100) / 100;
        }
        if (data.dueDate !== undefined) sanitized.dueDate = data.dueDate;
        if (data.category !== undefined) sanitized.category = sanitizeString(data.category).slice(0, 50);
        if (data.isPaid !== undefined) sanitized.isPaid = Boolean(data.isPaid);
        if (data.paidDate !== undefined) sanitized.paidDate = data.paidDate;
        if (data.isRecurring !== undefined) sanitized.isRecurring = Boolean(data.isRecurring);
        if (data.recurrence !== undefined) {
            if (data.recurrence === null || ['weekly', 'monthly', 'yearly'].includes(data.recurrence)) {
                sanitized.recurrence = data.recurrence;
            }
        }
        if (data.recurring !== undefined) sanitized.recurring = sanitizeString(data.recurring).slice(0, 20);
        if (data.priority !== undefined) {
            sanitized.priority = ['High', 'Medium', 'Low'].includes(data.priority) ? data.priority : 'Medium';
        }

        return BillService.update(idCheck.value, sanitized);
    },

    async delete(id, userId) {
        const blocked = checkRate(userId, 'bills.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        return BillService.delete(idCheck.value);
    },
};

// ============================================
// SECURE CATEGORY API
// ============================================

export const SecureCategoryAPI = {
    async getAll(userId) {
        const blocked = checkRate(userId, 'categories.getAll', apiRateLimiter);
        if (blocked) return { error: blocked.error.message };
        return CategoryService.getAll();
    },

    async create(type, data, userId) {
        const blocked = checkRate(userId, 'categories.create');
        if (blocked) return { error: blocked.error.message };

        const validation = validateCategoryData(type, data);
        if (!validation.valid) return validationError('Invalid category data', validation.errors);

        return CategoryService.create(type, validation.data, userId);
    },

    async update(id, data, userId) {
        const blocked = checkRate(userId, 'categories.update');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        const sanitized = {};
        if (data.name !== undefined) sanitized.name = sanitizeString(data.name).slice(0, 50);
        if (data.icon !== undefined) sanitized.icon = sanitizeString(data.icon).slice(0, 10);
        if (data.color !== undefined) {
            const c = String(data.color).trim();
            if (/^#[0-9a-fA-F]{3,8}$/.test(c) || /^[a-zA-Z]+$/.test(c)) sanitized.color = c;
        }

        return CategoryService.update(idCheck.value, sanitized);
    },

    async delete(id, categoryName, userId) {
        const blocked = checkRate(userId, 'categories.delete');
        if (blocked) return { error: blocked.error.message };

        const idCheck = validateUUID(id);
        if (!idCheck.valid) return validationError(idCheck.error);

        // Sanitize category name before passing to cascade delete
        const safeName = categoryName ? sanitizeString(categoryName).slice(0, 100) : null;
        return CategoryService.delete(idCheck.value, safeName, userId);
    },
};

// ============================================
// SECURE SETTINGS API (non-sensitive, no rate limit for reads)
// ============================================

export const SecureSettingsAPI = {
    async get() {
        return SettingsService.get();
    },

    async upsert(settings, userId) {
        const blocked = checkRate(userId, 'settings.upsert');
        if (blocked) return { error: blocked.error.message };

        // Whitelist only allowed setting fields
        const sanitized = {};
        if (settings.currency !== undefined) {
            const c = sanitizeString(settings.currency).slice(0, 5);
            sanitized.currency = c || '$';
        }
        if (settings.dateFormat !== undefined) {
            const valid = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
            sanitized.dateFormat = valid.includes(settings.dateFormat) ? settings.dateFormat : 'MM/DD/YYYY';
        }
        if (settings.notifications !== undefined) sanitized.notifications = Boolean(settings.notifications);
        if (settings.theme !== undefined) {
            sanitized.theme = ['light', 'dark'].includes(settings.theme) ? settings.theme : 'dark';
        }
        if (settings.language !== undefined) {
            sanitized.language = sanitizeString(settings.language).slice(0, 5);
        }
        if (settings.totalBudget !== undefined) {
            const num = parseFloat(settings.totalBudget);
            if (!isNaN(num) && num >= 0) sanitized.totalBudget = Math.round(num * 100) / 100;
        }

        return SettingsService.upsert(sanitized, userId);
    },
};

// ============================================
// UNIFIED EXPORT — single import for FinanceContext
// ============================================

const SecureAPI = {
    transactions: SecureTransactionAPI,
    budgets: SecureBudgetAPI,
    goals: SecureGoalAPI,
    investments: SecureInvestmentAPI,
    bills: SecureBillAPI,
    categories: SecureCategoryAPI,
    settings: SecureSettingsAPI,
};

export default SecureAPI;
