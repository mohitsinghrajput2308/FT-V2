/**
 * Secure API Client
 * Wraps all API calls with security features:
 * - Rate limiting
 * - Input validation
 * - Secure headers
 * - Error handling
 * 
 * Following OWASP Best Practices
 */

import { config, getSecureHeaders } from './config';
import { apiRateLimiter, authRateLimiter, mutationRateLimiter, createRateLimitResponse } from './rateLimit';
import { sanitizeString, validateEmail, validatePassword, validateTransactionData, validateInvestmentData } from './security';

// ============================================
// SECURE FETCH WRAPPER
// ============================================

/**
 * Secure fetch with rate limiting and error handling
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {object} securityOptions - Security configuration
 * @returns {Promise<object>}
 */
async function secureFetch(url, options = {}, securityOptions = {}) {
    const {
        rateLimiter = apiRateLimiter,
        userId = 'anonymous',
        skipRateLimit = false,
    } = securityOptions;

    // Check rate limit
    if (!skipRateLimit && config.security.enableRateLimiting) {
        const rateLimitResult = rateLimiter.checkLimit(userId, url);

        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for ${userId} on ${url}`);
            return createRateLimitResponse(rateLimitResult.retryAfter);
        }
    }

    // Get auth token
    const authToken = localStorage.getItem('authToken');

    // Prepare secure headers
    const headers = {
        ...getSecureHeaders(authToken),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin', // CSRF protection
        });

        // Handle rate limit response from server
        if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
            return createRateLimitResponse(retryAfter);
        }

        // Handle unauthorized
        if (response.status === 401) {
            // Clear auth state
            localStorage.removeItem('authToken');
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Your session has expired. Please log in again.',
                },
            };
        }

        // Parse response
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: data.code || 'API_ERROR',
                    message: data.message || 'An error occurred',
                },
            };
        }

        return { success: true, data };

    } catch (error) {
        console.error('[API Error]', error);
        return {
            success: false,
            error: {
                code: 'NETWORK_ERROR',
                message: 'Unable to connect to the server. Please check your connection.',
            },
        };
    }
}

// ============================================
// SECURE AUTH API
// ============================================

export const AuthAPI = {
    /**
     * Login with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<object>}
     */
    async login(email, password) {
        // Validate inputs
        const emailResult = validateEmail(email);
        if (!emailResult.valid) {
            return { success: false, error: { message: emailResult.error } };
        }

        // Use stricter rate limiting for auth
        const userId = sanitizeString(email);

        return secureFetch(`${config.api.baseUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: emailResult.value,
                password, // Don't log or sanitize passwords, just pass through
            }),
        }, {
            rateLimiter: authRateLimiter,
            userId,
        });
    },

    /**
     * Register new user
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @returns {Promise<object>}
     */
    async register(email, password, username) {
        // Validate all inputs
        const emailResult = validateEmail(email);
        if (!emailResult.valid) {
            return { success: false, error: { message: emailResult.error } };
        }

        const passwordResult = validatePassword(password);
        if (!passwordResult.valid) {
            return { success: false, error: { message: passwordResult.error } };
        }

        const sanitizedUsername = sanitizeString(username).slice(0, 30);
        if (sanitizedUsername.length < 3) {
            return { success: false, error: { message: 'Username must be at least 3 characters' } };
        }

        return secureFetch(`${config.api.baseUrl}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({
                email: emailResult.value,
                password,
                username: sanitizedUsername,
            }),
        }, {
            rateLimiter: authRateLimiter,
            userId: emailResult.value,
        });
    },

    /**
     * Logout current user
     * @returns {Promise<object>}
     */
    async logout() {
        localStorage.removeItem('authToken');
        return secureFetch(`${config.api.baseUrl}/auth/logout`, {
            method: 'POST',
        }, {
            skipRateLimit: true,
        });
    },
};

// ============================================
// SECURE TRANSACTION API
// ============================================

export const TransactionAPI = {
    /**
     * Create a new transaction
     * @param {object} transactionData
     * @returns {Promise<object>}
     */
    async create(transactionData) {
        // Validate and sanitize
        const validation = validateTransactionData(transactionData);
        if (!validation.valid) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid transaction data',
                    details: validation.errors,
                },
            };
        }

        return secureFetch(`${config.api.baseUrl}/transactions`, {
            method: 'POST',
            body: JSON.stringify(validation.data),
        }, {
            rateLimiter: mutationRateLimiter,
        });
    },

    /**
     * Get all transactions
     * @param {object} filters
     * @returns {Promise<object>}
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();

        // Sanitize filter inputs
        if (filters.startDate) params.set('startDate', sanitizeString(filters.startDate));
        if (filters.endDate) params.set('endDate', sanitizeString(filters.endDate));
        if (filters.category) params.set('category', sanitizeString(filters.category));
        if (filters.type && ['income', 'expense'].includes(filters.type)) {
            params.set('type', filters.type);
        }

        return secureFetch(`${config.api.baseUrl}/transactions?${params.toString()}`, {
            method: 'GET',
        });
    },

    /**
     * Delete a transaction
     * @param {string} id
     * @returns {Promise<object>}
     */
    async delete(id) {
        // Validate ID format (prevent injection)
        const sanitizedId = sanitizeString(id);
        if (!sanitizedId || sanitizedId.length > 36) {
            return { success: false, error: { message: 'Invalid transaction ID' } };
        }

        return secureFetch(`${config.api.baseUrl}/transactions/${sanitizedId}`, {
            method: 'DELETE',
        }, {
            rateLimiter: mutationRateLimiter,
        });
    },
};

// ============================================
// SECURE INVESTMENT API
// ============================================

export const InvestmentAPI = {
    /**
     * Add new investment
     * @param {object} investmentData
     * @returns {Promise<object>}
     */
    async create(investmentData) {
        const validation = validateInvestmentData(investmentData);
        if (!validation.valid) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid investment data',
                    details: validation.errors,
                },
            };
        }

        return secureFetch(`${config.api.baseUrl}/investments`, {
            method: 'POST',
            body: JSON.stringify(validation.data),
        }, {
            rateLimiter: mutationRateLimiter,
        });
    },

    /**
     * Get all investments
     * @returns {Promise<object>}
     */
    async getAll() {
        return secureFetch(`${config.api.baseUrl}/investments`, {
            method: 'GET',
        });
    },
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
    auth: AuthAPI,
    transactions: TransactionAPI,
    investments: InvestmentAPI,
    secureFetch,
};
