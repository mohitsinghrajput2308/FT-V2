import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
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
    const { currentUser, updateProfile, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings, transactions, budgets, goals, investments, bills, categories } = useFinance();
    const { success, error, warning } = useNotification();

    const [loading, setLoading] = useState(false);
    const [liveRate, setLiveRate] = useState(null);

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

        </div>
    );
};

export default Settings;
