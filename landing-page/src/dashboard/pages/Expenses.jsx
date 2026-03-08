import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowDownCircle } from 'lucide-react';
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

const Expenses = () => {
    const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, currency, dateFormat } = useFinance();

    const activeExpenseCategories = useMemo(() => {
        const mappedCategories = (categories?.expense || []).map(c => ({
            value: c.name,
            label: c.name
        }));

        return mappedCategories;
    }, [categories]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPayment, setFilterPayment] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        customPaymentMethod: '',
        description: '',
        is_recurring: false,
        recurrence: 'monthly'
    });
    const [errors, setErrors] = useState({});

    const expenseTransactions = useMemo(() => {
        let filtered = transactions.filter(t => t.type === 'expense');

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
        if (filterPayment) {
            filtered = filtered.filter(t => t.paymentMethod === filterPayment);
        }

        if (sortBy === 'amount') {
            return [...filtered].sort((a, b) => b.amount - a.amount);
        }
        return sortByDate(filtered, 'date', 'desc');
    }, [transactions, searchQuery, filterCategory, filterPayment, sortBy]);

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Dynamically build payment method filter options from actual transactions
    const dynamicPaymentOptions = useMemo(() => {
        const allExpenses = transactions.filter(t => t.type === 'expense');
        const unique = [...new Set(allExpenses.map(t => t.paymentMethod).filter(Boolean))];
        return [
            { value: '', label: 'All Payment Methods' },
            ...unique.map(m => ({ value: m, label: m }))
        ];
    }, [transactions]);

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
        if (!formData.name?.trim()) newErrors.name = 'Expense name is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required';
        }
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            category: formData.category,
            type: 'expense',
            paymentMethod: formData.paymentMethod === 'Other'
                ? (formData.customPaymentMethod.trim() || 'Other')
                : formData.paymentMethod,
            is_recurring: formData.is_recurring,
            recurrence: formData.is_recurring ? formData.recurrence : null,
            next_occurrence: formData.is_recurring ? calculateNextOccurrence(formData.date, formData.recurrence) : null
        };

        if (editingItem) {
            await updateTransaction(editingItem.id, data);
            closeModal();
        } else {
            const result = await addTransaction(data);
            // Only close modal on success; null means an error was shown as toast
            if (result !== null && result !== undefined) closeModal();
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                amount: item.amount.toString(),
                category: item.category,
                date: item.date,
                paymentMethod: item.paymentMethod || 'UPI',
                customPaymentMethod: '',
                description: item.description || '',
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
                paymentMethod: 'UPI',
                customPaymentMethod: '',
                description: '',
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
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            deleteTransaction(id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your spending</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Expense
                </Button>
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-danger-500 to-danger-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-danger-100">Total Expenses</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalExpenses, currency)}</p>
                    </div>
                    <ArrowDownCircle className="w-12 h-12 text-danger-200" />
                </div>
            </Card>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                        label="Search"
                        placeholder="Search expenses..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select
                        label="Category"
                        options={[{ value: '', label: 'All Categories' }, ...activeExpenseCategories]}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    />
                    <Select
                        label="Payment Method"
                        options={dynamicPaymentOptions}
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
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

            {/* Expense List */}
            {expenseTransactions.length === 0 ? (
                <EmptyState
                    icon={ArrowDownCircle}
                    title="No expenses recorded"
                    description="Start tracking your expenses to better manage your finances."
                    action={() => openModal()}
                    actionLabel="Add Expense"
                />
            ) : (
                <Card padding={false} hover={false}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseTransactions.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="text-gray-500 dark:text-gray-400 font-medium">
                                            {idx + 1}
                                        </td>
                                        <td>
                                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                        </td>
                                        <td>
                                            <span className="badge badge-danger">{item.category}</span>
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-400">{item.paymentMethod}</td>
                                        <td className="text-gray-600 dark:text-gray-400">
                                            {formatDate(item.date, dateFormat)}
                                        </td>
                                        <td className="font-semibold text-danger-600 dark:text-danger-400">
                                            -{formatCurrency(item.amount, currency)}
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
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Expense' : 'Add Expense'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Expense Description"
                        name="name"
                        placeholder="e.g., Grocery Shopping"
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
                            options={activeExpenseCategories}
                            value={formData.category}
                            onChange={handleChange}
                            error={errors.category}
                        />
                        <Select
                            label="Payment Method"
                            name="paymentMethod"
                            options={paymentMethods}
                            value={formData.paymentMethod}
                            onChange={handleChange}
                        />
                    </div>
                    {formData.paymentMethod === 'Other' && (
                        <Input
                            label="Specify Payment Method"
                            name="customPaymentMethod"
                            placeholder="e.g., Cheque, Crypto, Gift Card..."
                            value={formData.customPaymentMethod}
                            onChange={handleChange}
                        />
                    )}
                    <Input
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        error={errors.date}
                    />

                    {/* Recurring Options */}
                    <div className="flex items-center gap-2 pt-2 pb-1">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-dark-300 focus:ring-2 dark:bg-dark-400 dark:border-dark-500"
                        />
                        <label htmlFor="is_recurring" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Repeat this transaction
                        </label>
                    </div>

                    {formData.is_recurring && (
                        <div className="pl-6 animate-fade-in">
                            <Select
                                label="Recurrence Interval"
                                name="recurrence"
                                options={[
                                    { value: 'daily', label: 'Daily' },
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'yearly', label: 'Yearly' }
                                ]}
                                value={formData.recurrence || 'monthly'}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (Optional)</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            placeholder="Add notes..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth>
                            {editingItem ? 'Update' : 'Add'} Expense
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
