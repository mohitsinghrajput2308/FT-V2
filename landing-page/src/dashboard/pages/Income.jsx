import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ArrowUpCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, sortByDate, calculateNextOccurrence } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';

const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Other', label: 'Other' }
];

const Income = () => {
    const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, currency, dateFormat } = useFinance();

    const activeIncomeCategories = useMemo(() => {
        const mappedCategories = (categories?.income || []).map(c => ({
            value: c.name,
            label: c.name
        }));

        return mappedCategories;
    }, [categories]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Bank Transfer',
        customPaymentMethod: '',
        is_recurring: false,
        recurrence: 'monthly'
    });
    const [errors, setErrors] = useState({});

    const incomeTransactions = useMemo(() => {
        let filtered = transactions.filter(t => t.type === 'income');

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterCategory) {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        if (sortBy === 'amount') {
            return [...filtered].sort((a, b) => b.amount - a.amount);
        }

        return sortByDate(filtered, 'date', 'desc');
    }, [transactions, searchQuery, filterCategory, sortBy]);

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Income source is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required';
        }
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            category: formData.category,
            type: 'income',
            paymentMethod: formData.paymentMethod === 'Other'
                ? (formData.customPaymentMethod.trim() || 'Other')
                : formData.paymentMethod,
            is_recurring: formData.is_recurring,
            recurrence: formData.is_recurring ? formData.recurrence : null,
            next_occurrence: formData.is_recurring ? calculateNextOccurrence(formData.date, formData.recurrence) : null
        };

        if (editingItem) {
            updateTransaction(editingItem.id, data);
        } else {
            addTransaction(data);
        }

        closeModal();
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                amount: item.amount.toString(),
                category: item.category,
                date: item.date,
                description: item.description || '',
                paymentMethod: item.paymentMethod || 'Bank Transfer',
                customPaymentMethod: '',
                is_recurring: item.is_recurring || false,
                recurrence: item.recurrence || 'monthly'
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                paymentMethod: 'Bank Transfer',
                customPaymentMethod: '',
                is_recurring: false,
                recurrence: 'monthly'
            });
        }
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        setFormData({
            name: '',
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            paymentMethod: 'Bank Transfer',
            customPaymentMethod: '',
            is_recurring: false,
            recurrence: 'monthly'
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this income entry?')) {
            deleteTransaction(id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your income sources</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Income
                </Button>
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-success-100">Total Income</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalIncome, currency)}</p>
                    </div>
                    <ArrowUpCircle className="w-12 h-12 text-success-200" />
                </div>
            </Card>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                        label="Search"
                        placeholder="Search income..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select
                        label="Category"
                        options={[{ value: '', label: 'All Categories' }, ...activeIncomeCategories]}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    />
                    <Select
                        label="Sort By"
                        options={[
                            { value: 'date', label: 'Date (Newest)' },
                            { value: 'amount', label: 'Amount (Highest)' }
                        ]}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    />
                </div>
            </Card>

            {/* Income List */}
            {incomeTransactions.length === 0 ? (
                <EmptyState
                    icon={ArrowUpCircle}
                    title="No income entries"
                    description="Start tracking your income by adding your first entry."
                    action={() => openModal()}
                    actionLabel="Add Income"
                />
            ) : (
                <Card padding={false} hover={false}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Source</th>
                                    <th>Category</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomeTransactions.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="text-gray-500 dark:text-gray-400 font-medium">
                                            {idx + 1}
                                        </td>
                                        <td>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                {item.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-success">{item.category}</span>
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-400">{item.paymentMethod}</td>
                                        <td className="text-gray-600 dark:text-gray-400">
                                            {formatDate(item.date, dateFormat)}
                                        </td>
                                        <td className="font-semibold text-success-600 dark:text-success-400">
                                            +{formatCurrency(item.amount, currency)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Income' : 'Add Income'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Income Source"
                        name="name"
                        placeholder="e.g., Monthly Salary"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={handleChange}
                        error={errors.amount}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Category"
                            name="category"
                            options={activeIncomeCategories}
                            value={formData.category}
                            onChange={handleChange}
                            error={errors.category}
                        />
                        <Input
                            label="Date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            error={errors.date}
                        />
                    </div>
                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        options={paymentMethods}
                        value={formData.paymentMethod}
                        onChange={handleChange}
                    />
                    {formData.paymentMethod === 'Other' && (
                        <Input
                            label="Specify Payment Method"
                            name="customPaymentMethod"
                            placeholder="e.g., Cheque, Crypto, Gift Card..."
                            value={formData.customPaymentMethod}
                            onChange={handleChange}
                        />
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            placeholder="Add notes..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Recurring Options */}
                    <div className="flex items-center gap-2 pt-2 pb-1">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={handleChange}
                            className="w-4 h-4 text-success-600 bg-gray-100 border-gray-300 rounded focus:ring-success-500 dark:focus:ring-success-600 dark:ring-offset-dark-300 focus:ring-2 dark:bg-dark-400 dark:border-dark-500"
                        />
                        <label htmlFor="is_recurring" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Repeat this income
                        </label>
                    </div>

                    {formData.is_recurring && (
                        <div className="pl-6 animate-fade-in">
                            <Select
                                label="Recurrence Interval"
                                name="recurrence"
                                options={[
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'yearly', label: 'Yearly' }
                                ]}
                                value={formData.recurrence || 'monthly'}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth>
                            {editingItem ? 'Update' : 'Add'} Income
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Income;
