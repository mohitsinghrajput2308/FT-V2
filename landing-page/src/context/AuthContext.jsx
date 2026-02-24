import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    // Modal open/view state
    const [modalState, setModalState] = useState({ isOpen: false, view: 'login' });

    // Real Supabase session state
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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

    // Modal helpers
    const openLogin = () => setModalState({ isOpen: true, view: 'login' });
    const openRegister = () => setModalState({ isOpen: true, view: 'register' });
    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    // Auth actions exposed to the whole app
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

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            modalState, openLogin, openRegister, closeModal,
            user, session, isLoadingAuth,
            signIn, signUp, signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthModal must be used within an AuthProvider');
    return context;
};
