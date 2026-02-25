import { useState } from 'react';
import { Save, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import { exportAllData, importData, clearAllStorage, initializeWithSampleData } from '../utils/localStorage';
import { downloadFile } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';

const Settings = () => {
    const { currentUser, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings } = useFinance();
    const { success, error, warning } = useNotification();

    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);

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

        // Update settings
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

    const handleExport = () => {
        try {
            const data = exportAllData();
            const json = JSON.stringify(data, null, 2);
            downloadFile(json, `finance_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            success('Data exported successfully!');
        } catch (err) {
            error('Failed to export data');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                importData(data);
                success('Data imported successfully! Refreshing...');
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                error('Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        clearAllStorage();
        success('All data cleared! Redirecting...');
        setTimeout(() => window.location.reload(), 1500);
    };

    const handleLoadSampleData = () => {
        initializeWithSampleData(true);
        success('Sample data loaded! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
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
                    <Select
                        label="Currency"
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        options={[
                            { value: '$', label: '$ US Dollar (USD)' },
                            { value: '€', label: '€ Euro (EUR)' },
                            { value: '£', label: '£ British Pound (GBP)' },
                            { value: '₹', label: '₹ Indian Rupee (INR)' }
                        ]}
                    />
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

            {/* Data Management */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleExport} variant="secondary" icon={Download}>
                            Export Data (JSON)
                        </Button>
                        <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import Data
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-dark-300">
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={handleLoadSampleData} variant="secondary">
                                Load Sample Data
                            </Button>
                            <Button onClick={() => setConfirmModal(true)} variant="danger" icon={Trash2}>
                                Clear All Data
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Warning: Clearing data will remove all your transactions, budgets, and settings.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Confirm Clear Modal */}
            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Clear All Data?" size="sm">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        This action cannot be undone. All your data will be permanently deleted.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setConfirmModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={() => { handleClearData(); setConfirmModal(false); }} fullWidth>
                            Clear All Data
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
