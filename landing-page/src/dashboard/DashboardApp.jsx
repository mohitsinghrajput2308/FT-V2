/**
 * DashboardApp - Wraps the dashboard with its own providers and routes
 * This is the entry point for all /dashboard/* routes
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Dashboard Providers
import { NotificationProvider } from './context/NotificationContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Investments from './pages/Investments';
import Bills from './pages/Bills';
import Calculators from './pages/Calculators';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Help from './pages/Help';
import ApiDocs from './pages/ApiDocs/ApiDocs';
import DashboardPricing from './pages/DashboardPricing';

const DashboardApp = () => {
    // All financial data is loaded from Supabase via FinanceContext.
    // No localStorage seeding — Supabase is the single source of truth.

    return (
        <ThemeProvider>
            <NotificationProvider>
                <FinanceProvider>
                    <ProtectedRoute>
                        <ErrorBoundary>
                            <Layout>
                                <Routes>
                                    <Route index element={<Dashboard />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="income" element={<Income />} />
                                    <Route path="expenses" element={<Expenses />} />
                                    <Route path="budgets" element={<Budgets />} />
                                    <Route path="goals" element={<Goals />} />
                                    <Route path="transactions" element={<Transactions />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="investments" element={<Investments />} />
                                    <Route path="bills" element={<Bills />} />
                                    <Route path="calculators" element={<Calculators />} />
                                    <Route path="categories" element={<Categories />} />
                                    <Route path="pricing" element={<DashboardPricing />} />
                                    <Route path="settings" element={<Settings />} />
                                    <Route path="help" element={<Help />} />
                                    <Route path="api-docs" element={<ApiDocs />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </Layout>
                        </ErrorBoundary>
                    </ProtectedRoute>
                </FinanceProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
};

export default DashboardApp;
