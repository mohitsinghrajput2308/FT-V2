import { useState, useEffect } from 'react';
import { Save, RefreshCw, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { SUPPORTED_CURRENCIES, SYMBOL_TO_CODE, fetchFxRates } from '../utils/fxService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';

import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';


const Settings = () => {
    const { currentUser, updateProfile, logout, deleteAccount } = useAuth();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings, transactions, budgets, goals, investments, bills, categories } = useFinance();
    const { success, error, warning } = useNotification();

    const [loading, setLoading] = useState(false);
    const [liveRate, setLiveRate] = useState(null);
    const [wipeModal, setWipeModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleWipeData = async () => {
        setActionLoading(true);
        // This is a UI mockup placeholder for stripping data rows.
        await new Promise(res => setTimeout(res, 1200));
        success('All financial data wiped successfully.');
        setWipeModal(false);
        setActionLoading(false);
    };

    const handleDeleteAccount = async () => {
        setActionLoading(true);
        const { success: ok, error: err } = await deleteAccount();
        if (ok) {
            success('Account deleted successfully.');
        } else {
            error(err || 'Failed to delete account.');
            setActionLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        currency: settings.currency || '$',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY',
        theme: theme,
        notifications: {
            email: settings.notifications?.email ?? true,
            push: settings.notifications?.push ?? true,
            billReminders: settings.notifications?.billReminders ?? true,
            budgetAlerts: settings.notifications?.budgetAlerts ?? true
        }
    });

    useEffect(() => {
        fetchFxRates().then(rates => {
            const code = SYMBOL_TO_CODE[formData.currency] ?? 'USD';
            setLiveRate(rates?.[code] ?? null);
        }).catch(() => {});
    }, [formData.currency]);

    // Keep the dropdown in sync if the theme is changed from the Navbar toggle
    useEffect(() => {
        setFormData(prev => ({ ...prev, theme }));
    }, [theme]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Apply theme instantly — no need to wait for Save
        if (field === 'theme') setTheme(value);
    };

    const handleNotificationChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [field]: value }
        }));
    };

    const handleSave = () => {
        setLoading(true);

        // Update theme
        setTheme(formData.theme);

        // Update settings (syncs to Supabase via FinanceContext → SecureAPI)
        updateSettings({
            currency: formData.currency,
            dateFormat: formData.dateFormat,
            notifications: formData.notifications
        });

        // Update user profile with currency preference
        updateProfile({ currency: formData.currency, dateFormat: formData.dateFormat });

        setLoading(false);
        success('Settings saved successfully!');
    };


    const handleReset = () => {
        setFormData({
            currency: '$',
            dateFormat: 'MM/DD/YYYY',
            theme: 'light',
            notifications: {
                email: true,
                push: true,
                billReminders: true,
                budgetAlerts: true
            }
        });
        warning('Settings reset to defaults (not saved yet)');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Customize your app preferences</p>
            </div>

            {/* Preferences */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Select
                            label="Currency"
                            value={formData.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            options={SUPPORTED_CURRENCIES.map(c => ({ value: c.symbol, label: c.label }))}
                        />
                        {liveRate !== null && formData.currency !== '$' && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Live rate: 1 USD = {liveRate.toFixed(4)} {SYMBOL_TO_CODE[formData.currency]}
                            </p>
                        )}
                    </div>
                    <Select
                        label="Date Format"
                        value={formData.dateFormat}
                        onChange={(e) => handleChange('dateFormat', e.target.value)}
                        options={[
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                        ]}
                    />
                    <Select
                        label="Theme"
                        value={formData.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        options={[
                            { value: 'light',  label: '☀️  Light Mode' },
                            { value: 'dark',   label: '🌙  Dark Mode' },
                            { value: 'system', label: '🖥️  System Default' }
                        ]}
                    />
                </div>
            </Card>



            {/* Save & Reset */}
            <Card>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSave} loading={loading} icon={Save}>
                        Save Settings
                    </Button>
                    <Button onClick={handleReset} variant="secondary" icon={RefreshCw}>
                        Reset to Defaults
                    </Button>
                </div>
            </Card>



            {/* DATA MANAGEMENT */}
            <div className="pt-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Data Management</h3>
                <Card className="border border-danger-200/50 dark:border-danger-900/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-lg font-semibold text-danger-600 dark:text-danger-500">Wipe All Data</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete all your financial history</p>
                        </div>
                        <Button variant="danger" onClick={() => setWipeModal(true)}>
                            Wipe Data
                        </Button>
                    </div>
                </Card>
            </div>

            {/* ACCOUNT */}
            <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                <Card className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Sign Out</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Logout securely from your account</p>
                        </div>
                        <Button variant="secondary" onClick={() => logout()}>
                            Logout
                        </Button>
                    </div>
                </Card>
                <Card className="border border-danger-200/50 dark:border-danger-900/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-lg font-semibold text-danger-600 dark:text-danger-500">Delete Account</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
                        </div>
                        <Button variant="danger" onClick={() => setDeleteModal(true)}>
                            Delete My Account
                        </Button>
                    </div>
                </Card>
            </div>

            {/* MODALS */}
            <Modal isOpen={wipeModal} onClose={() => !actionLoading && setWipeModal(false)} title="Wipe All Data?">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        This action <strong>cannot be undone</strong>. This will permanently delete your transactions, budgets, goals, investments, and settings.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setWipeModal(false)} fullWidth disabled={actionLoading}>Cancel</Button>
                        <Button variant="danger" onClick={handleWipeData} loading={actionLoading} fullWidth>Yes, wipe data</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={deleteModal} onClose={() => !actionLoading && setDeleteModal(false)} title="Delete Account?">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-danger-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete everything?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        This action <strong>cannot be undone</strong>. This will instantly delete your account profile, credentials, and all financial data from our servers.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setDeleteModal(false)} fullWidth disabled={actionLoading}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteAccount} loading={actionLoading} fullWidth>Delete Account</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
