import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);

// ── Session timeout: 30 minutes of inactivity ──
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    // Modal open/view state
    const [modalState, setModalState] = useState({ isOpen: false, view: 'login' });

    // Real Supabase session state
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Mock local state for pro subscription (until Stripe is connected)
    const [localIsPro, setLocalIsPro] = useState(false);

    const inactivityTimer = useRef(null);

    // ── Sign out (stable reference) ──
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    // ── Inactivity timeout: auto-logout after 30 min of no activity ──
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            console.warn('[SECURITY] Session timed out due to inactivity.');
            signOut();
        }, SESSION_TIMEOUT_MS);
    }, [signOut]);

    // Track user activity events to reset the timer
    useEffect(() => {
        // Only run timer when user is logged in
        if (!user) {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            return;
        }

        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => resetInactivityTimer();

        // Start the timer
        resetInactivityTimer();

        // Listen for activity
        activityEvents.forEach(event =>
            window.addEventListener(event, handleActivity, { passive: true })
        );

        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            activityEvents.forEach(event =>
                window.removeEventListener(event, handleActivity)
            );
        };
    }, [user, resetInactivityTimer]);

    // ── Supabase auth listener ──
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
            // When user clicks password reset email link, open the reset view
            if (_event === 'PASSWORD_RECOVERY') {
                setModalState({ isOpen: true, view: 'resetPassword' });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // ── Modal helpers ──
    const openLogin = () => setModalState({ isOpen: true, view: 'login' });
    const openRegister = () => setModalState({ isOpen: true, view: 'register' });
    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    // ── Auth actions ──
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) closeModal();
        return { data, error };
    };

    const signUp = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: window.location.origin,
            },
        });
        return { data, error };
    };

    // ── Dashboard user mapping (replaces the old bridge AuthContext) ──
    // Maps the raw Supabase user to the shape dashboard components expect.
    const currentUser = useMemo(() => {
        if (!user) return null;
        return {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.user_metadata?.phone || '',
            occupation: user.user_metadata?.occupation || '',
            bio: user.user_metadata?.bio || '',
            security_question: user.user_metadata?.security_question || '',
            security_answer: user.user_metadata?.security_answer || '',
            currency: '$',
            dateFormat: 'MM/DD/YYYY',
            createdAt: user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            lastSignIn: user.last_sign_in_at || null,
            avatar: user.user_metadata?.avatar_url || null,
            isPro: user.user_metadata?.is_pro || localIsPro,
        };
    }, [user, localIsPro]);

    // ── Dashboard-compatible aliases ──
    const logout = signOut;

    const updateProfile = async ({ full_name, avatar_url, phone, occupation, bio, security_question, security_answer } = {}) => {
        try {
            const updates = {};
            if (full_name !== undefined) updates.full_name = full_name;
            if (avatar_url !== undefined) updates.avatar_url = avatar_url;
            if (phone !== undefined) updates.phone = phone;
            if (occupation !== undefined) updates.occupation = occupation;
            if (bio !== undefined) updates.bio = bio;
            if (security_question !== undefined) updates.security_question = security_question;
            if (security_answer !== undefined) updates.security_answer = security_answer;

            // Update Supabase auth metadata
            const { error: metaError } = await supabase.auth.updateUser({ data: updates });
            if (metaError) return { success: false, error: metaError.message };

            // Sync to profiles table (only supported columns)
            const profileUpdates = { updated_at: new Date().toISOString() };
            if (full_name !== undefined) profileUpdates.full_name = full_name;
            if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;
            await supabase.from('profiles').update(profileUpdates).eq('id', user.id);

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const changePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const deleteAccount = async () => {
        try {
            // Delete user data from profiles table first
            await supabase.from('profiles').delete().eq('id', user.id);
            // Sign out (server-side deletion requires admin API; sign out for now)
            await supabase.auth.signOut();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // ── Upgrade Action — redirect to pricing page ──
    const upgradeToPro = () => {
        window.location.href = '/pricing';
    };

    return (
        <AuthContext.Provider value={{
            // Landing page API (useAuthModal consumers)
            modalState, openLogin, openRegister, closeModal,
            user, session, isLoadingAuth,
            signIn, signUp, signOut,

            // Dashboard API (useAuth consumers)
            currentUser,
            loading: isLoadingAuth,
            isAuthenticated: !!user,
            login: signIn,
            register: signUp,
            logout,
            updateProfile,
            changePassword,
            deleteAccount,
            upgradeToPro,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuthModal — Landing page hook (modal state + raw Supabase data).
 * Used by: Navbar, HeroSection, CTASection, AuthModal, App.js
 */
export const useAuthModal = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthModal must be used within an AuthProvider');
    return context;
};

/**
 * useAuth — Dashboard hook (currentUser, logout, isAuthenticated).
 * Used by: ProtectedRoute, Navbar, Profile, Settings, FinanceContext
 *
 * This is the SAME context — just a semantic alias so dashboard code
 * can keep using `useAuth()` without any import changes needed.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
