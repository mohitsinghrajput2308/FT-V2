import { useState, useEffect } from 'react';
import { Save, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES, SYMBOL_TO_CODE, fetchFxRates } from '../utils/fxService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { clearAllStorage } from '../utils/localStorage';
import { downloadFile } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import PlaidLinkButton from '../components/PlaidLink/PlaidLinkButton';

const Settings = () => {
    const { currentUser, updateProfile, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings, transactions, budgets, goals, investments, bills, categories } = useFinance();
    const { success, error, warning } = useNotification();

    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [liveRate, setLiveRate] = useState(null);
    const [linkedBank, setLinkedBank] = useState(null);

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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    // Export uses live Supabase data from FinanceContext (not localStorage)
    const handleExport = () => {
        try {
            const data = {
                transactions,
                budgets,
                goals,
                investments,
                bills,
                categories,
                settings,
                exportedAt: new Date().toISOString(),
                exportedBy: currentUser?.email || 'unknown',
            };
            const json = JSON.stringify(data, null, 2);
            downloadFile(json, `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            success('Data exported successfully!');
        } catch (err) {
            error('Failed to export data');
        }
    };

    // Import is disabled in the Supabase-backed version — data is managed via the dashboard UI.
    // A future version could support bulk import via a Supabase Edge Function.
    const handleImport = () => {
        warning('Import is not available in the current version. Please add data through the dashboard.');
    };

    // Clear localStorage preferences only — Supabase data is unaffected
    const handleClearData = () => {
        clearAllStorage();
        success('Local preferences cleared! Logging out...');
        setTimeout(() => logout(), 1500);
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
                            { value: 'light', label: 'Light Mode' },
                            { value: 'dark', label: 'Dark Mode' }
                        ]}
                    />
                </div>
            </Card>

            {/* Notifications */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
                <div className="space-y-3">
                    {[
                        { key: 'email', label: 'Email Notifications' },
                        { key: 'push', label: 'Push Notifications' },
                        { key: 'billReminders', label: 'Bill Reminders' },
                        { key: 'budgetAlerts', label: 'Budget Alerts' }
                    ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300 cursor-pointer">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <input
                                type="checkbox"
                                checked={formData.notifications[item.key]}
                                onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>
                    ))}
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

            {/* Connected Accounts (Plaid) */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Connected Bank Accounts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Link your bank account to automatically import transactions.
                </p>
                {linkedBank ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="text-green-600 dark:text-green-400 text-xl">🏦</span>
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">{linkedBank}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">Account linked successfully</p>
                        </div>
                    </div>
                ) : (
                    <PlaidLinkButton
                        onSuccess={(result) => setLinkedBank(result?.institution ?? 'Your Bank')}
                        onError={(msg) => error(typeof msg === 'string' ? msg : 'Bank linking failed')}
                    />
                )}
            </Card>

            {/* Data Management */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleExport} variant="secondary" icon={Download}>
                            Export Data (JSON)
                        </Button>
                        <Button onClick={handleImport} variant="secondary" icon={Upload}>
                            Import Data
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-dark-300">
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => setConfirmModal(true)} variant="danger" icon={Trash2}>
                                Clear Local Cache
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Clears locally cached preferences. Your Supabase data (transactions, budgets, etc.) is not affected.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Confirm Clear Modal */}
            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Clear Local Cache?" size="sm">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        This will clear your locally cached preferences (theme, currency). Your financial data in Supabase is safe and unaffected. You will be logged out.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setConfirmModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={() => { handleClearData(); setConfirmModal(false); }} fullWidth>
                            Clear & Log Out
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
