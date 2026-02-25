/**
 * Secure Configuration & Environment Variable Handler
 * Following OWASP Best Practices for API Key Security
 *
 * IMPORTANT: Never commit actual keys. Use .env files with
 * REACT_APP_ prefix (CRA convention).
 */

// ============================================
// ENVIRONMENT VARIABLE ACCESS (CRA-compatible)
// ============================================

function getEnvVar(key, defaultValue = '') {
    // CRA exposes env vars with REACT_APP_ prefix via process.env
    return process.env[key]
        || process.env[`REACT_APP_${key}`]
        || defaultValue;
}

// ============================================
// CONFIGURATION OBJECT
// ============================================

export const config = {
    app: {
        name: getEnvVar('APP_NAME', 'FinTrack'),
        version: getEnvVar('APP_VERSION', '1.0.0'),
        environment: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV !== 'production',
    },

    api: {
        supabaseUrl: getEnvVar('SUPABASE_URL', ''),
        supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', ''),
        timeout: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),
    },

    security: {
        enableRateLimiting: getEnvVar('ENABLE_RATE_LIMITING', 'true') === 'true',
        // 30-minute session inactivity timeout
        sessionTimeoutMs: parseInt(getEnvVar('SESSION_TIMEOUT_MS', '1800000'), 10),
    },

    features: {
        enableAnalytics: getEnvVar('ENABLE_ANALYTICS', 'false') === 'true',
    },
};

// ============================================
// SECURITY VALIDATION — runs on module load
// ============================================

export function validateSecurityConfig() {
    const warnings = [];

    if (config.app.isProduction) {
        const demoPatterns = ['demo', 'test', 'example', 'xxx', 'placeholder'];
        Object.entries(config.api).forEach(([key, value]) => {
            if (typeof value === 'string') {
                demoPatterns.forEach(pattern => {
                    if (value.toLowerCase().includes(pattern)) {
                        warnings.push(`[SECURITY] ${key} appears to contain a placeholder value`);
                    }
                });
            }
        });
    }

    warnings.forEach(w => console.warn(w));
    return warnings.length === 0;
}

// ============================================
// SECURE HEADERS
// ============================================

/**
 * Get secure headers for API requests.
 * NOTE: Supabase SDK manages its own auth headers via the session.
 * These headers are for any additional REST/external API calls.
 */
export function getSecureHeaders(authToken = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': config.app.version,
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
}

// Run on module load
if (typeof window !== 'undefined') {
    validateSecurityConfig();
}

export default config;
