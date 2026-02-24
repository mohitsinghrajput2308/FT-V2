import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowDownCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, sortByDate } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';

const expenseCategories = [
    { value: 'Food', label: 'Food' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
];

const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Other', label: 'Other' }
];

const Expenses = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, currency, dateFormat } = useFinance();
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
        description: ''
    });
    const [errors, setErrors] = useState({});

    const expenseTransactions = useMemo(() => {
        let filtered = transactions.filter(t => t.type === 'expense');

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Expense name is required';
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
            type: 'expense'
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
                name: item.name,
                amount: item.amount.toString(),
                category: item.category,
                date: item.date,
                paymentMethod: item.paymentMethod || 'UPI',
                description: item.description || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'UPI',
                description: ''
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
        <div className="space-y-6">
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
                        placeholder="Search expenses..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select
                        placeholder="All Categories"
                        options={expenseCategories}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    />
                    <Select
                        placeholder="All Payment Methods"
                        options={paymentMethods}
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                    />
                    <Select
                        placeholder="Sort By"
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
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseTransactions.map((item) => (
                                <tr key={item.id}>
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
                            options={expenseCategories}
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
                    <Input
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        error={errors.date}
                    />
                    <div>
                        <label className="label">Notes (Optional)</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="input"
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
