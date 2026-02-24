/**
 * FinTrack Security Validation Script
 * Run before every release: node scripts/validate-security.js
 * 
 * Checks for common security mistakes in the codebase.
 * Exit code 0 = all checks passed, 1 = failures detected.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readFile(relativePath) {
    const fullPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf8');
}

function findFiles(dir, extensions, results = []) {
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        if (entry.isDirectory()) {
            findFiles(fullPath, extensions, results);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

// ============================================
// Security Checks
// ============================================

const checks = [
    {
        name: 'No hardcoded Supabase URLs in source code',
        test: () => {
            const srcFiles = findFiles(path.join(ROOT, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('.supabase.co') && !content.includes('process.env')) {
                    return { pass: false, detail: `Hardcoded Supabase URL in: ${path.relative(ROOT, file)}` };
                }
            }
            return { pass: true };
        },
    },
    {
        name: 'No hardcoded API keys in source code',
        test: () => {
            const srcFiles = findFiles(path.join(ROOT, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
            const keyPattern = /eyJhbGciOi/; // JWT prefix
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                if (keyPattern.test(content)) {
                    return { pass: false, detail: `Hardcoded JWT/API key in: ${path.relative(ROOT, file)}` };
                }
            }
            return { pass: true };
        },
    },
    {
        name: '.env file exists with required variables',
        test: () => {
            const env = readFile('.env');
            if (!env) return { pass: false, detail: '.env file not found' };
            const hasUrl = env.includes('EXPO_PUBLIC_SUPABASE_URL=');
            const hasKey = env.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=');
            if (!hasUrl || !hasKey) {
                return { pass: false, detail: 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env' };
            }
            return { pass: true };
        },
    },
    {
        name: '.env is in .gitignore',
        test: () => {
            const gitignore = readFile('.gitignore');
            if (!gitignore) return { pass: false, detail: '.gitignore not found' };
            const lines = gitignore.split('\n').map(l => l.trim());
            if (!lines.includes('.env')) {
                return { pass: false, detail: '.env is NOT listed in .gitignore — credentials will be committed!' };
            }
            return { pass: true };
        },
    },
    {
        name: 'No console.log of sensitive data',
        test: () => {
            const srcFiles = findFiles(path.join(ROOT, 'src'), ['.ts', '.tsx']);
            const sensitivePatterns = [
                /console\.log.*password/i,
                /console\.log.*token/i,
                /console\.log.*key/i,
                /console\.log.*secret/i,
                /console\.log.*credential/i,
            ];
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                for (const pattern of sensitivePatterns) {
                    if (pattern.test(content)) {
                        return { pass: false, detail: `Sensitive data logged in: ${path.relative(ROOT, file)}` };
                    }
                }
            }
            return { pass: true };
        },
    },
    {
        name: 'RLS enabled on all tables in schema',
        test: () => {
            const schema = readFile('supabase_schema.sql');
            if (!schema) return { pass: false, detail: 'supabase_schema.sql not found' };
            const tables = ['profiles', 'transactions', 'budgets', 'investments'];
            const missing = tables.filter(t => !schema.includes(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`));
            if (missing.length > 0) {
                return { pass: false, detail: `RLS not enabled for: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: 'Security patch SQL exists with audit tables',
        test: () => {
            const patch = readFile('supabase_security_patch.sql');
            if (!patch) return { pass: false, detail: 'supabase_security_patch.sql not found' };
            const required = ['audit_logs', 'log_audit', 'description_no_html', 'no_future_dates'];
            const missing = required.filter(r => !patch.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Security patch missing: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: 'Rate limiting present in auth hook',
        test: () => {
            const auth = readFile('src/hooks/useAuth.tsx');
            if (!auth) return { pass: false, detail: 'useAuth.tsx not found' };
            if (!auth.includes('RATE_LIMIT') && !auth.includes('rateLimiter') && !auth.includes('checkLimit')) {
                return { pass: false, detail: 'No rate limiting found in useAuth.tsx' };
            }
            return { pass: true };
        },
    },
    {
        name: 'Input validation present in auth hook',
        test: () => {
            const auth = readFile('src/hooks/useAuth.tsx');
            if (!auth) return { pass: false, detail: 'useAuth.tsx not found' };
            if (!auth.includes('validateEmail') && !auth.includes('validatePassword')) {
                return { pass: false, detail: 'No input validation found in useAuth.tsx' };
            }
            return { pass: true };
        },
    },
    // === Multi-Tenant & RBAC Checks ===
    {
        name: 'Multi-tenant migration SQL exists',
        test: () => {
            const migration = readFile('supabase_multitenant_migration.sql');
            if (!migration) return { pass: false, detail: 'supabase_multitenant_migration.sql not found' };
            const required = ['organizations', 'branding_settings', 'invitations', 'get_user_org_id', 'has_role'];
            const missing = required.filter(r => !migration.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Multi-tenant migration missing: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: 'RBAC types defined in database.ts',
        test: () => {
            const types = readFile('src/types/database.ts');
            if (!types) return { pass: false, detail: 'database.ts not found' };
            const required = ['UserRole', 'Organization', 'BrandingSettings', 'organization_id'];
            const missing = required.filter(r => !types.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Missing RBAC/multi-tenant types: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: 'No India-specific content in landing page',
        test: () => {
            const landingDir = path.join(ROOT, 'landing page', 'frontend', 'src');
            const files = findFiles(landingDir, ['.js', '.jsx']);
            const patterns = [/Made in India/i, /Built for Bharat/i, /India-First/i, /IndianRupee/];
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                for (const pattern of patterns) {
                    if (pattern.test(content)) {
                        return { pass: false, detail: `India-specific content in: ${path.relative(ROOT, file)} (${pattern})` };
                    }
                }
            }
            return { pass: true };
        },
    },
    {
        name: 'No hardcoded Razorpay references',
        test: () => {
            const allFiles = [
                ...findFiles(path.join(ROOT, 'src'), ['.ts', '.tsx', '.js', '.jsx']),
                ...findFiles(path.join(ROOT, 'landing page', 'frontend', 'src'), ['.js', '.jsx']),
            ];
            for (const file of allFiles) {
                const content = fs.readFileSync(file, 'utf8');
                if (/razorpay/i.test(content)) {
                    return { pass: false, detail: `Razorpay reference in: ${path.relative(ROOT, file)}` };
                }
            }
            return { pass: true };
        },
    },
    // === Auth Hardening Checks ===
    {
        name: 'Auth hardening migration SQL exists',
        test: () => {
            const migration = readFile('supabase_auth_hardening.sql');
            if (!migration) return { pass: false, detail: 'supabase_auth_hardening.sql not found' };
            const required = ['email_verifications', 'captcha_verifications', 'verify_otp', 'create_otp', 'generate_otp'];
            const missing = required.filter(r => !migration.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Auth hardening migration missing: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: 'OAuth provider support in auth hook',
        test: () => {
            const auth = readFile('src/hooks/useAuth.tsx');
            if (!auth) return { pass: false, detail: 'useAuth.tsx not found' };
            const required = ['signInWithProvider', 'signInWithOAuth', 'google', 'azure', 'apple', 'verifyOTP', 'sendVerificationOTP'];
            const missing = required.filter(r => !auth.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Auth hook missing OAuth/OTP features: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    // === 2FA (TOTP) Checks ===
    {
        name: '2FA migration SQL exists',
        test: () => {
            const migration = readFile('supabase_2fa_migration.sql');
            if (!migration) return { pass: false, detail: 'supabase_2fa_migration.sql not found' };
            const required = ['totp_secrets', 'backup_codes', 'tfa_attempts', 'generate_backup_codes', 'verify_backup_code', 'get_tfa_status'];
            const missing = required.filter(r => !migration.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `2FA migration missing: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
    {
        name: '2FA support in auth hook',
        test: () => {
            const auth = readFile('src/hooks/useAuth.tsx');
            if (!auth) return { pass: false, detail: 'useAuth.tsx not found' };
            const required = ['setup2FA', 'verify2FASetup', 'verify2FALogin', 'verifyBackupCode', 'disable2FA', 'get2FAStatus', 'tfaState'];
            const missing = required.filter(r => !auth.includes(r));
            if (missing.length > 0) {
                return { pass: false, detail: `Auth hook missing 2FA features: ${missing.join(', ')}` };
            }
            return { pass: true };
        },
    },
];

// ============================================
// Run all checks
// ============================================

console.log('');
console.log('🔒 FinTrack Security Validation');
console.log('================================');
console.log('');

let passed = 0;
let failed = 0;

checks.forEach((check, i) => {
    try {
        const result = check.test();
        if (result.pass) {
            console.log(`  ✅ ${check.name}`);
            passed++;
        } else {
            console.log(`  ❌ ${check.name}`);
            console.log(`     └─ ${result.detail}`);
            failed++;
        }
    } catch (err) {
        console.log(`  ❌ ${check.name}`);
        console.log(`     └─ Error: ${err.message}`);
        failed++;
    }
});

console.log('');
console.log('================================');
console.log(`  ${passed}/${checks.length} passed, ${failed} failed`);
console.log('');

if (failed > 0) {
    console.log('  ⚠️  Fix the above issues before releasing!');
    process.exit(1);
} else {
    console.log('  🎉 All security checks passed!');
    process.exit(0);
}
