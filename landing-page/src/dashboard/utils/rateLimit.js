/**
 * Rate Limiting Utility
 * Client-side rate limiting with IP-based and user-based tracking
 * Following OWASP Best Practices
 */

// ============================================
// RATE LIMIT CONFIGURATION
// ============================================

const RATE_LIMITS = {
    // Authentication endpoints (strict)
    auth: {
        maxRequests: 5,      // Max 5 attempts
        windowMs: 15 * 60 * 1000,  // Per 15 minutes
        blockDurationMs: 30 * 60 * 1000,  // Block for 30 minutes if exceeded
    },

    // API endpoints (moderate)
    api: {
        maxRequests: 100,    // Max 100 requests
        windowMs: 60 * 1000, // Per minute
        blockDurationMs: 5 * 60 * 1000,
    },

    // Data mutations (create/update/delete)
    mutation: {
        maxRequests: 30,     // Max 30 mutations
        windowMs: 60 * 1000, // Per minute
        blockDurationMs: 10 * 60 * 1000,
    },

    // File uploads
    upload: {
        maxRequests: 10,     // Max 10 uploads
        windowMs: 60 * 60 * 1000,  // Per hour
        blockDurationMs: 60 * 60 * 1000,
    },
};

// In-memory storage for rate limiting (use Redis in production)
const rateLimitStore = new Map();

// ============================================
// RATE LIMITER CLASS
// ============================================

class RateLimiter {
    constructor(config = RATE_LIMITS.api) {
        this.maxRequests = config.maxRequests;
        this.windowMs = config.windowMs;
        this.blockDurationMs = config.blockDurationMs;
    }

    /**
     * Generate a unique key for the rate limit bucket
     * @param {string} identifier - User ID or IP address
     * @param {string} endpoint - API endpoint or action name
     * @returns {string}
     */
    getKey(identifier, endpoint = 'default') {
        return `ratelimit:${endpoint}:${identifier}`;
    }

    /**
     * Check if request is allowed
     * @param {string} identifier - User ID or IP address
     * @param {string} endpoint - API endpoint
     * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfter?: number }}
     */
    checkLimit(identifier, endpoint = 'default') {
        const key = this.getKey(identifier, endpoint);
        const now = Date.now();

        // Get or create bucket
        let bucket = rateLimitStore.get(key);

        if (!bucket) {
            bucket = {
                requests: [],
                blockedUntil: 0,
            };
            rateLimitStore.set(key, bucket);
        }

        // Check if currently blocked
        if (bucket.blockedUntil > now) {
            const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);
            return {
                allowed: false,
                remaining: 0,
                resetAt: bucket.blockedUntil,
                retryAfter,
                message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            };
        }

        // Clean old requests outside the window
        bucket.requests = bucket.requests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Check if limit exceeded
        if (bucket.requests.length >= this.maxRequests) {
            bucket.blockedUntil = now + this.blockDurationMs;
            const retryAfter = Math.ceil(this.blockDurationMs / 1000);
            return {
                allowed: false,
                remaining: 0,
                resetAt: bucket.blockedUntil,
                retryAfter,
                message: `Rate limit exceeded. Blocked for ${retryAfter} seconds.`,
            };
        }

        // Record this request
        bucket.requests.push(now);

        const remaining = this.maxRequests - bucket.requests.length;
        const oldestRequest = bucket.requests[0] || now;
        const resetAt = oldestRequest + this.windowMs;

        return {
            allowed: true,
            remaining,
            resetAt,
        };
    }

    /**
     * Reset rate limit for an identifier
     * @param {string} identifier
     * @param {string} endpoint
     */
    reset(identifier, endpoint = 'default') {
        const key = this.getKey(identifier, endpoint);
        rateLimitStore.delete(key);
    }
}

// ============================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================

export const authRateLimiter = new RateLimiter(RATE_LIMITS.auth);
export const apiRateLimiter = new RateLimiter(RATE_LIMITS.api);
export const mutationRateLimiter = new RateLimiter(RATE_LIMITS.mutation);
export const uploadRateLimiter = new RateLimiter(RATE_LIMITS.upload);

// ============================================
// RATE LIMIT MIDDLEWARE FOR API CALLS
// ============================================

/**
 * Wrapper function that applies rate limiting to any async function
 * @param {Function} fn - The function to wrap
 * @param {RateLimiter} limiter - Rate limiter to use
 * @param {string} userId - User identifier
 * @returns {Function}
 */
export function withRateLimit(fn, limiter = apiRateLimiter, userId = 'anonymous') {
    return async (...args) => {
        const result = limiter.checkLimit(userId, fn.name || 'api');

        if (!result.allowed) {
            // Return a 429-like response
            const error = new Error(result.message);
            error.status = 429;
            error.retryAfter = result.retryAfter;
            throw error;
        }

        return fn(...args);
    };
}

/**
 * React hook for rate limiting
 * @param {string} action - Action name
 * @param {object} options - Rate limit options
 * @returns {{ checkLimit: Function, remaining: number, isBlocked: boolean }}
 */
export function useRateLimit(action = 'default', options = RATE_LIMITS.api) {
    const limiter = new RateLimiter(options);

    // Get user ID from localStorage or generate anonymous ID
    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    };

    const checkLimit = () => {
        return limiter.checkLimit(getUserId(), action);
    };

    return { checkLimit, limiter };
}

// ============================================
// GRACEFUL 429 RESPONSE HANDLER
// ============================================

/**
 * Create a user-friendly rate limit error response
 * @param {number} retryAfter - Seconds until retry is allowed
 * @returns {object}
 */
export function createRateLimitResponse(retryAfter) {
    return {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'You have made too many requests. Please slow down.',
            retryAfter,
            retryAfterMs: retryAfter * 1000,
            hint: `You can try again in ${formatRetryTime(retryAfter)}.`,
        },
    };
}

/**
 * Format retry time for display
 * @param {number} seconds
 * @returns {string}
 */
function formatRetryTime(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    return `${Math.ceil(seconds / 3600)} hours`;
}

// ============================================
// CLEANUP (prevent memory leaks)
// ============================================

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitStore.entries()) {
        // Remove if no requests in last hour and not blocked
        if (bucket.requests.length === 0 && bucket.blockedUntil < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export default RateLimiter;
