/**
 * Secure Configuration & Environment Variable Handler
 * Following OWASP Best Practices for API Key Security
 * 
 * IMPORTANT: Never commit this file with actual keys!
 * Use environment variables in production.
 */

// ============================================
// ENVIRONMENT VARIABLE ACCESS
// ============================================

/**
 * Safely get environment variable with fallback
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Fallback value (only for non-sensitive configs)
 * @returns {string}
 */
function getEnvVar(key, defaultValue = '') {
    // Vite exposes env vars with VITE_ prefix
    const value = import.meta.env[key] || import.meta.env[`VITE_${key}`] || defaultValue;
    return value;
}

/**
 * Get required environment variable (throws if missing)
 * @param {string} key - Environment variable name
 * @returns {string}
 */
function getRequiredEnvVar(key) {
    const value = getEnvVar(key);
    if (!value) {
        console.error(`[SECURITY] Missing required environment variable: ${key}`);
        // Don't expose which variable is missing in production
        if (import.meta.env.PROD) {
            throw new Error('Application configuration error');
        }
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

// ============================================
// CONFIGURATION OBJECT
// ============================================

export const config = {
    // App Info (non-sensitive)
    app: {
        name: getEnvVar('APP_NAME', 'FinanceTracker'),
        version: getEnvVar('APP_VERSION', '1.0.0'),
        environment: import.meta.env.MODE || 'development',
        isProduction: import.meta.env.PROD === true,
        isDevelopment: import.meta.env.DEV === true,
    },

    // API Configuration
    api: {
        // Supabase - These should come from environment variables
        supabaseUrl: getEnvVar('SUPABASE_URL', ''),
        supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', ''),

        // API base URL
        baseUrl: getEnvVar('API_BASE_URL', ''),

        // Timeouts
        timeout: parseInt(getEnvVar('API_TIMEOUT', '30000')),
    },

    // Security Settings
    security: {
        // Rate limiting
        enableRateLimiting: getEnvVar('ENABLE_RATE_LIMITING', 'true') === 'true',

        // Session timeout (30 minutes default)
        sessionTimeoutMs: parseInt(getEnvVar('SESSION_TIMEOUT_MS', '1800000')),

        // CSRF protection
        enableCSRF: getEnvVar('ENABLE_CSRF', 'true') === 'true',
    },

    // Feature Flags
    features: {
        enableAnalytics: getEnvVar('ENABLE_ANALYTICS', 'false') === 'true',
        enableAds: getEnvVar('ENABLE_ADS', 'false') === 'true',
    },
};

// ============================================
// API KEY SECURITY CHECKS
// ============================================

/**
 * Validate that no sensitive keys are exposed
 * This runs on app initialization
 */
export function validateSecurityConfig() {
    const warnings = [];

    // Check for hardcoded keys (should never happen in production)
    if (config.app.isProduction) {
        // Supabase anon key check
        if (config.api.supabaseAnonKey && config.api.supabaseAnonKey.includes('eyJ')) {
            // This is expected for Supabase, but log for awareness
            console.info('[SECURITY] Supabase anon key detected (this is expected for client-side auth)');
        }

        // Check for demo/test keys
        const demoPatterns = ['demo', 'test', 'example', 'xxx', 'placeholder'];
        Object.entries(config.api).forEach(([key, value]) => {
            if (typeof value === 'string') {
                demoPatterns.forEach(pattern => {
                    if (value.toLowerCase().includes(pattern)) {
                        warnings.push(`[SECURITY WARNING] ${key} appears to contain a placeholder value`);
                    }
                });
            }
        });
    }

    // Log warnings
    warnings.forEach(warning => console.warn(warning));

    return warnings.length === 0;
}

// ============================================
// SECURE HEADERS FOR API REQUESTS
// ============================================

/**
 * Get secure headers for API requests
 * @param {string} authToken - Optional auth token
 * @returns {object}
 */
export function getSecureHeaders(authToken = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',  // CSRF protection
        'X-Client-Version': config.app.version,
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
}

// ============================================
// KEY ROTATION SUPPORT
// ============================================

/**
 * Check if API key needs rotation
 * (Integration point for key rotation system)
 * @returns {boolean}
 */
export function checkKeyRotation() {
    const lastRotation = localStorage.getItem('lastKeyRotation');
    const rotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (!lastRotation) {
        localStorage.setItem('lastKeyRotation', Date.now().toString());
        return false;
    }

    const timeSinceRotation = Date.now() - parseInt(lastRotation);
    if (timeSinceRotation > rotationInterval) {
        console.info('[SECURITY] API keys should be rotated');
        return true;
    }

    return false;
}

// ============================================
// INITIALIZATION
// ============================================

// Run security validation on module load
if (typeof window !== 'undefined') {
    validateSecurityConfig();
    checkKeyRotation();
}

export default config;
