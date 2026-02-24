/**
 * Dashboard Auth Bridge
 * Bridges Final One's Supabase auth to the interface expected by dashboard components.
 * Dashboard components use: useAuth() → { currentUser, logout, isAuthenticated, loading, ... }
 */
import { createContext, useContext, useMemo } from 'react';
import { useAuthModal } from '../../context/AuthContext';
import {
    getFromStorage,
    saveToStorage,
    STORAGE_KEYS,
    initializeWithSampleData,
    isAppInitialized
} from '../utils/localStorage';

const DashboardAuthContext = createContext();

export const useAuth = () => {
    const context = useContext(DashboardAuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a DashboardAuthProvider');
    }
    return context;
};

export const DashboardAuthProvider = ({ children }) => {
    const { user, session, isLoadingAuth, signOut } = useAuthModal();

    // Initialize sample finance data if needed
    if (!isAppInitialized()) {
        initializeWithSampleData();
    }

    // Map Supabase user to the format dashboard components expect
    const currentUser = useMemo(() => {
        if (!user) return null;
        return {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            currency: '$',
            dateFormat: 'MM/DD/YYYY',
            createdAt: user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            avatar: user.user_metadata?.avatar_url || null,
        };
    }, [user]);

    const logout = async () => {
        await signOut();
        // Navigate will happen via ProtectedRoute
    };

    // Stubs for profile/password (Supabase handles these differently)
    const updateProfile = () => ({ success: true });
    const changePassword = () => ({ success: true });

    const value = {
        currentUser,
        loading: isLoadingAuth,
        login: () => {},       // Not used in dashboard (handled by landing page)
        register: () => {},    // Not used in dashboard (handled by landing page)
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
    };

    return (
        <DashboardAuthContext.Provider value={value}>
            {children}
        </DashboardAuthContext.Provider>
    );
};

export default DashboardAuthContext;
