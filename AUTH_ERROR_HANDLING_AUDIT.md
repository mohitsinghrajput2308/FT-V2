# FinTrack Authentication & Error Handling Audit

## Executive Summary
The codebase has **basic session management** but is **critically missing** retry logic, reconnection handling, and token refresh on tab return. This creates risks for:
- Network flakiness causing permanent data loss
- Expired tokens not being refreshed when user returns to tab
- Offline incidents not being recovered from automatically

---

## 1. AUTHCONTEXT.JSX - Session Management

### Location
[src/context/AuthContext.jsx](src/context/AuthContext.jsx)

### Current Implementation

#### Token Refresh Mechanism
```javascript
// Line 77-81: Auto-refresh is enabled on SIGNED_IN event
if (_event === 'SIGNED_IN') {
    try { supabase.auth.startAutoRefresh(); } catch { /* not critical */ }
}
```

**Status**: ✅ Token auto-refresh enabled
- Supabase client has `autoRefreshToken: true` configured
- `startAutoRefresh()` is called after sign-in

#### Session Timeout Handling
```javascript
// Line 7: 30-minute inactivity timeout
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Lines 37-43: Inactivity timer implementation
const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
        console.warn('[SECURITY] Session timed out due to inactivity.');
        signOut();
    }, SESSION_TIMEOUT_MS);
}, [signOut]);

// Lines 45-65: Activity tracking
const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
const handleActivity = () => resetInactivityTimer();
```

**Status**: ✅ Inactivity timeout implemented
- Logs out after 30 minutes of no activity
- Tracks activity events: mousedown, keydown, scroll, touchstart

#### Session Recovery When User Returns
```javascript
// Lines 71-88: Supabase auth listener (initial + ongoing)
useEffect(() => {
    // Load existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoadingAuth(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Re-enable auto-refresh when a new session is established after sign-out
        if (_event === 'SIGNED_IN') {
            try { supabase.auth.startAutoRefresh(); } catch { /* not critical */ }
        }
        // When user clicks password reset email link, open the reset view
        if (_event === 'PASSWORD_RECOVERY') {
            setModalState({ isOpen: true, view: 'resetPassword' });
        }
    });

    return () => subscription.unsubscribe();
}, []);
```

**Status**: ⚠️ PARTIAL - Only passive recovery
- Loads existing session on mount
- Listens for auth state changes
- **MISSING**: No explicit refresh attempt when user returns to tab after being away

### Critical Gaps

#### 🔴 NO Tab Visibility Handler
**Missing code**: When user brings tab back into focus after being away, there's no attempt to refresh the token or check if session is still valid.

```javascript
// NOT IMPLEMENTED - Should add:
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden && user) {
            // User is back in tab - refresh session
            supabase.auth.refreshSession();
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [user]);
```

#### 🔴 NO Offline/Online Event Handlers
**Missing code**: No listening for network connectivity changes.

```javascript
// NOT IMPLEMENTED - Should add:
useEffect(() => {
    const handleOnline = async () => {
        if (user) {
            // Network is back - attempt to refresh session
            const { data, error } = await supabase.auth.refreshSession();
            if (error) console.error('Session refresh failed:', error);
        }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
}, [user]);
```

---

## 2. SECUREAPI.JS - API Error Handling

### Location
[src/dashboard/utils/secureApi.js](src/dashboard/utils/secureApi.js)

### Current Implementation

#### Error Response Format
```javascript
// Lines 41-46: Standard error wrapper
function validationError(message, details) {
    console.warn(`[SECURITY] Validation failed: ${message}`, details);
    return { error: message, details };
}
```

#### Rate Limit Enforcement
```javascript
// Lines 34-40: Rate limit check
function checkRate(userId, action, limiter = mutationRateLimiter) {
    if (!config.security.enableRateLimiting) return null;
    const result = limiter.checkLimit(userId || 'anonymous', action);
    if (!result.allowed) {
        console.warn(`[SECURITY] Rate limit exceeded: ${action} by ${userId}`);
        return createRateLimitResponse(result.retryAfter);
    }
    return null; // allowed
}
```

**Status**: ✅ Rate limiting implemented
- Per-action rate limits enforced
- Returns structured error with retry time

#### Sample API Method (Transaction Create)
```javascript
// Lines 84-99: Typical API method structure
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
}
```

**Status**: ✅ Basic error handling present
- Validates input
- Checks rate limits
- Returns structured errors

### Critical Gaps

#### 🔴 NO Retry Logic for Transient Failures
**Missing code**: API errors are never retried. A transient network blip causes permanent failure.

```javascript
// NOT IMPLEMENTED - Should have:
async createWithRetry(data, userId, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await SecureAPI.transactions.create(data, userId);
        
        if (!result.error) return result; // Success
        
        // Check if error is transient (network, 5xx, timeout)
        if (isTransientError(result.error) && attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }
        
        return result; // Permanent error or max retries exceeded
    }
}
```

#### 🔴 NO Specific 401/403 Handling
**Missing code**: Expired or invalid tokens are not caught and handled specially.

```javascript
// NOT IMPLEMENTED - Should have:
if (result.error && result.error.includes('401')) {
    // Token expired - trigger re-authentication
    await AuthContext.signOut();
    // Notify user to log back in
}

if (result.error && result.error.includes('403')) {
    // Permission denied - could be subscription expiry
    // Notify user
}
```

#### 🔴 NO Request Timeout Configuration
**Missing code**: No timeout for hanging requests. Users wait indefinitely or the request never completes.

```javascript
// NOT IMPLEMENTED - Should have:
const makeRequestWithTimeout = async (request, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        const result = await request(controller.signal);
        clearTimeout(timeout);
        return result;
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            return { error: 'Request timeout' };
        }
        throw error;
    }
};
```

---

## 3. FINANCECONTEXT.JSX - Data Fetching & Error Recovery

### Location
[src/dashboard/context/FinanceContext.jsx](src/dashboard/context/FinanceContext.jsx)

### Current Implementation

#### Data Fetching on Mount
```javascript
// Lines 103-151: Data fetching with Promise.allSettled
useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;

    let cancelled = false;
    const fetchAll = async () => {
        setSyncStatus('syncing');
        try {
            const [txRes, budRes, goalRes, invRes, billRes, catRes, settRes] = await Promise.allSettled([
                SecureAPI.transactions.getAll(userId),
                SecureAPI.budgets.getAll(userId),
                SecureAPI.goals.getAll(userId),
                SecureAPI.investments.getAll(userId),
                SecureAPI.bills.getAll(userId),
                SecureAPI.categories.getAll(userId),
                SecureAPI.settings.get(userId),
            ]);

            if (cancelled) return;

            // For financial data: Supabase or empty (NO localStorage fallback)
            const resolveSecure = (result, fallback) => {
                if (result.status === 'fulfilled' && result.value.data && !result.value.error) {
                    return result.value.data;
                }
                return fallback;
            };
            
            // ... set state ...
            
            const allSucceeded = financialResults
                .every(r => r.status === 'fulfilled' && r.value.data && !r.value.error);
            setSyncStatus(allSucceeded ? 'synced' : 'offline');

        } catch (err) {
            console.error('[FinanceContext] Sync failed:', err);
            if (cancelled) return;
            setSyncStatus('offline');
        } finally {
            if (!cancelled) setLoading(false);
        }
    };

    fetchAll();
    return () => { cancelled = true; };
}, [userId]);
```

**Status**: ✅ Graceful degradation on error
- Uses `Promise.allSettled` (doesn't fail on partial failures)
- Sets `syncStatus` to 'offline' on failure
- Has cleanup to prevent state updates after unmount

#### Error Handling in Mutations
```javascript
// Lines 197-205: Transaction create with error handling
const addTransaction = useCallback(async (data) => {
    const result = await SecureAPI.transactions.create(data, userId);
    if (result.error) {
        notifyError?.(result.error);
        return null;
    }
    setTransactions(prev => [result.data, ...prev]);
    success?.(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully`);
    return result.data;
}, [userId, success, notifyError]);
```

**Status**: ✅ Shows error notifications
- Catches API errors
- Notifies user
- Doesn't update local state on error

### Critical Gaps

#### 🔴 NO Automatic Retry on Failure
**Missing code**: When fetch fails, status is set to 'offline' but there's no automatic retry attempt.

```javascript
// NOT IMPLEMENTED - Should have:
const [retryCount, setRetryCount] = useState(0);

const fetchAllWithRetry = async () => {
    setSyncStatus('syncing');
    try {
        const results = await Promise.allSettled([/* ... */]);
        // ... process results ...
        setSyncStatus(allSucceeded ? 'synced' : 'offline');
        if (!allSucceeded && retryCount < 3) {
            // Schedule auto-retry with exponential backoff
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                fetchAllWithRetry();
            }, Math.pow(2, retryCount) * 1000);
        }
    } catch (err) {
        setSyncStatus('offline');
        // Similar retry logic
    }
};
```

#### 🔴 NO Network Change Detection
**Missing code**: No listener for `online` event to trigger retry when network returns.

```javascript
// NOT IMPLEMENTED - Should have:
useEffect(() => {
    const handleOnline = () => {
        if (syncStatus === 'offline') {
            setSyncStatus('syncing');
            fetchAll(); // Retry fetch
        }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
}, [syncStatus]);
```

#### 🔴 NO Manual Retry Trigger for User
**Missing code**: UI doesn't expose a way for users to manually retry after failure.

```javascript
// NOT IMPLEMENTED - Should expose:
const manualRetry = useCallback(async () => {
    setSyncStatus('syncing');
    await fetchAll();
}, []);

// Then context value includes:
export const value = {
    // ... existing ...
    syncStatus,
    retrySync: manualRetry, // ← Add this
};
```

#### 🔴 NO Session Recovery Trigger
**Missing code**: If user returns to tab after long absence, there's no attempt to sync.

```javascript
// NOT IMPLEMENTED - Should have:
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden && userId) {
            // User is back in tab
            if (syncStatus === 'offline' || syncStatus === 'idle') {
                setSyncStatus('syncing');
                fetchAll();
            }
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [userId, syncStatus]);
```

---

## 4. SUPABASESERVICE.JS - Database Layer

### Location
[src/dashboard/services/supabaseService.js](src/dashboard/services/supabaseService.js)

### Current Implementation

#### Generic Error Handler
```javascript
// Lines 154-157: Standard error handling
const handleError = (operation, error) => {
    console.error(`[SupabaseService] ${operation} failed:`, error?.message || error);
    return { error: error?.message || 'An unexpected error occurred' };
};
```

#### Sample Method (Transaction Create)
```javascript
// Lines 173-183: Transaction create
async create(transaction) {
    try {
        const payload = toSupabaseTransaction(transaction);
        const { data, error } = await supabase
            .from('transactions')
            .insert(payload)
            .select()
            .single();
        if (error) return handleError('create transaction', error);
        return { data: fromSupabaseTransaction(data) };
    } catch (err) { return handleError('create transaction', err); }
}
```

**Status**: ✅ Try-catch with error wrapping
- All operations wrapped in try-catch
- Returns structured error objects

### Critical Gaps

#### 🔴 NO Retry on Transient DB Errors
**Missing code**: All errors are treated identically. No retry for 5xx, connection errors, or timeouts.

```javascript
// NOT IMPLEMENTED - Should have:
async createWithRetry(transaction, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const payload = toSupabaseTransaction(transaction);
            const { data, error } = await supabase
                .from('transactions')
                .insert(payload)
                .select()
                .single();
            
            if (error) {
                // Check if transient
                if (isTransientDBError(error) && attempt < maxRetries) {
                    await delay(Math.pow(2, attempt - 1) * 1000);
                    continue;
                }
                return handleError('create transaction', error);
            }
            
            return { data: fromSupabaseTransaction(data) };
        } catch (err) {
            if (isNetworkError(err) && attempt < maxRetries) {
                await delay(Math.pow(2, attempt - 1) * 1000);
                continue;
            }
            return handleError('create transaction', err);
        }
    }
}

function isTransientDBError(error) {
    return error?.code?.startsWith('PGRST') || // PostgreSQL errors
           error?.status >= 500 || // Server errors
           error?.message?.includes('timeout');
}

function isNetworkError(err) {
    return err.message?.includes('Failed to fetch') ||
           err.message?.includes('Network error') ||
           err.name === 'TypeError'; // Often network-related
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### 🔴 NO Timeout Configuration
**Missing code**: No timeout on Supabase queries. Hanging requests never fail.

```javascript
// NOT IMPLEMENTED - Should have:
const QUERY_TIMEOUT_MS = 30000;

async getAll() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
        
        // Note: supabase-js doesn't natively support AbortController yet
        // So implement via Promise.race:
        const result = await Promise.race([
            supabase
                .from('transactions')
                .select('*')
                .order('transaction_date', { ascending: false }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT_MS)
            )
        ]);
        
        clearTimeout(timeout);
        return { data: result };
    } catch (err) {
        return handleError('getAll transactions', err);
    }
}
```

---

## 5. SUPABASE.JS - Client Configuration

### Location
[src/lib/supabase.js](src/lib/supabase.js)

### Current Implementation
```javascript
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Pass-through lock: bypasses both navigator.locks (prevents
            // NavigatorLockAcquireTimeoutError in multi-tab scenarios) and
            // the Promise-queue approach (which deadlocks when a network
            // error leaves a queued operation permanently pending).
            lock: (_name, _acquireTimeout, fn) => fn(),
        },
    }
);
```

**Status**: ✅ Good foundation
- `persistSession: true` - saves session to localStorage
- `autoRefreshToken: true` - auto-refreshes tokens
- No-op lock to prevent multi-tab deadlocks

### Critical Gaps

#### 🔴 NO Realtime Reconnection Handler
**Missing code**: If realtime connection drops, there's no explicit reconnection attempt.

```javascript
// NOT IMPLEMENTED - Should add:
supabase.realtime.socket.addEventListener('close', () => {
    console.warn('[Supabase] Realtime connection closed');
    // Attempt to reconnect
    setTimeout(() => {
        supabase.realtime.socket.connect();
    }, 5000); // Try reconnecting after 5s
});
```

#### 🔴 NO Request Timeout at Client Level
**Missing code**: Supabase client doesn't have a global timeout. Queries can hang indefinitely.

```javascript
// NOT IMPLEMENTED - Currently no global timeout configuration
// Would need wrapper functions around supabase calls
```

---

## 6. USEPRICEUPDATE.JS - Hook-Level Error Handling

### Location
[src/dashboard/hooks/usePriceUpdater.js](src/dashboard/hooks/usePriceUpdater.js)

### Current Implementation
```javascript
const usePriceUpdater = (symbol, interval = 10000) => {
    const [price, setPrice] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPrice = useCallback(async () => {
        if (!symbol) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbol)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const q = data.quoteResponse?.result?.[0];
            if (q && activeRef.current) {
                setPrice(q.regularMarketPrice ?? null);
                setError(null);
            }
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setIsLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        // ... setup polling interval ...
        const id = setInterval(fetchPrice, interval);
        return () => {
            activeRef.current = false;
            clearInterval(id);
        };
    }, [symbol, interval, fetchPrice]);

    return { price, change, isLoading, error, lastUpdated };
};
```

**Status**: ✅ Basic polling with error capture
- Polls at 10-second intervals
- Captures and reports errors
- Cleans up on unmount

### Critical Gaps

#### ⚠️ NO Retry Logic for Failed Fetches
**Issue**: Single fetch failure means price doesn't update until next interval.

```javascript
// CURRENT: Just waits 10 seconds
// SHOULD: Retry quickly with backoff
```

#### ⚠️ NO Exponential Backoff on Repeated Failures
**Issue**: If API is down, continues hammering it every 10 seconds without backing off.

```javascript
// NOT IMPLEMENTED - Should reduce polling frequency on consecutive failures
const [failureCount, setFailureCount] = useState(0);

const fetchPrice = useCallback(async () => {
    try {
        // ... fetch ...
        setFailureCount(0); // Reset on success
    } catch (err) {
        setFailureCount(prev => prev + 1);
    }
}, []);

useEffect(() => {
    // Increase interval based on failure count
    const interval = 10000 * Math.pow(1.5, failureCount);
    const id = setInterval(fetchPrice, interval);
    return () => clearInterval(id);
}, [failureCount]);
```

---

## 7. RATELIMIT.JS - Rate Limiting

### Location
[src/dashboard/utils/rateLimit.js](src/dashboard/utils/rateLimit.js)

### Current Implementation
```javascript
const RATE_LIMITS = {
    mutation: {
        maxRequests: 100,    // Max 100 mutations per minute
        windowMs: 60 * 1000, // Per minute
        blockDurationMs: 2 * 60 * 1000, // Block for 2 min
    },
};

class RateLimiter {
    checkLimit(identifier, endpoint = 'default') {
        const key = this.getKey(identifier, endpoint);
        const now = Date.now();

        let bucket = rateLimitStore.get(key);
        if (!bucket) {
            bucket = { requests: [], blockedUntil: 0 };
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
            };
        }

        // Clean old requests outside the window
        bucket.requests = bucket.requests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Check if limit exceeded
        if (bucket.requests.length >= this.maxRequests) {
            bucket.blockedUntil = now + this.blockDurationMs;
            return {
                allowed: false,
                remaining: 0,
                resetAt: bucket.blockedUntil,
                retryAfter: Math.ceil(this.blockDurationMs / 1000),
            };
        }

        // Record this request
        bucket.requests.push(now);
        return {
            allowed: true,
            remaining: this.maxRequests - bucket.requests.length,
            resetAt: bucket.requests[0] + this.windowMs,
        };
    }
}
```

**Status**: ✅ Rate limiting implemented
- Tracks requests per user per action
- Blocks after exceeding limit
- Returns retry-after times

### Note
Rate limiting is **not for error recovery** - it's for abuse prevention. If user hits rate limit, they should back off. This is working as designed.

---

## Summary Table

| Component | Token Refresh | Session Recovery | Retry Logic | 401/403 Handling | Timeout | Network Recovery | Tab Return |
|-----------|---------------|------------------|-------------|------------------|---------|------------------|------------|
| AuthContext | ✅ Auto | ⚠️ Passive | ❌ No | ⚠️ Logout only | ❌ No | ❌ No | ❌ No |
| secureApi | N/A | N/A | ❌ No | ❌ No | ❌ No | N/A | N/A |
| FinanceContext | N/A | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| supabaseService | N/A | N/A | ❌ No | ❌ No | ❌ No | N/A | N/A |
| supabase.js | ✅ Auto | N/A | ❌ No | ❌ No | ❌ No | ❌ No | N/A |
| usePriceUpdater | N/A | N/A | ⚠️ Partial | ❌ No | ✅ Polling | ❌ No | N/A |

---

## Critical Issues Ranked by Impact

### 🔴 P0: CRITICAL
1. **NO retry logic on transient API failures** → User data mutations fail permanently on network blip
2. **NO token refresh when user returns to tab** → User gets 401 error after inactivity
3. **NO automatic data sync retry** → Offline mode is permanent unless user manually refreshes

### 🟠 P1: HIGH
4. **NO request timeout configuration** → Requests can hang indefinitely
5. **NO specific 401/403 error handling** → Expired sessions not properly handled
6. **NO network change detection** → App stays offline even after network returns

### 🟡 P2: MEDIUM
7. **NO exponential backoff on repeated failures** → Can hammer API/DB unnecessarily
8. **NO manual retry UI** → Users can't recover without full page reload
9. **NO rate limit retry scheduling** → Rate-limited users have no guidance on retry timing

---

## Recommended Fixes (Priority Order)

### Fix 1: Add Tab Visibility Handler (AuthContext)
```javascript
useEffect(() => {
    const handleVisibilityChange = async () => {
        if (!document.hidden && user) {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) console.warn('Session refresh failed:', error);
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [user]);
```

### Fix 2: Add Retry Wrapper to secureApi.js
```javascript
async function withRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await operation();
            return result;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            if (!isTransientError(error)) throw error;
            await delay(Math.pow(2, i) * 1000);
        }
    }
}
```

### Fix 3: Add Network Recovery to FinanceContext
```javascript
useEffect(() => {
    const handleOnline = async () => {
        if (syncStatus === 'offline' && userId) {
            setSyncStatus('syncing');
            await fetchAll();
        }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
}, [userId, syncStatus]);
```

### Fix 4: Add Request Timeout to Queries
```javascript
const withTimeout = (promise, timeoutMs = 30000) => 
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        )
    ]);
```

---

## Testing Recommendations

1. **Simulate network failures** during API calls - verify retry happens
2. **Simulate token expiration** - verify 401 is caught and user is logged out
3. **Leave tab inactive for 30+ minutes** - verify session timeout works
4. **Switch tabs and return** - verify token is refreshed
5. **Disconnect network** - verify app enters offline mode
6. **Reconnect network** - verify automatic retry/sync begins
7. **Simulate slow network** - verify requests timeout instead of hanging
8. **Rate limit a user** - verify retryAfter is respected

