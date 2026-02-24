import { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, RefreshCw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, calculatePercentage, getBudgetColor, getCurrentMonth } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import ProgressBar from '../components/Common/ProgressBar';
import EmptyState from '../components/Common/EmptyState';

const categories = [
    { value: 'Food', label: 'Food' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
];

const Budgets = () => {
    const { budgets, addBudget, updateBudget, deleteBudget, transactions, currency } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        limit: ''
    });
    const [errors, setErrors] = useState({});

    const currentMonth = getCurrentMonth();

    // Calculate actual spending per category for current month
    const monthlyExpenses = transactions.filter(
        t => t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    const spendingByCategory = monthlyExpenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    // Merge budgets with actual spending
    const budgetsWithSpending = budgets.map(b => ({
        ...b,
        spent: spendingByCategory[b.category] || 0
    }));

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = Object.values(spendingByCategory).reduce((sum, v) => sum + v, 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.limit || parseFloat(formData.limit) <= 0) {
            newErrors.limit = 'Valid budget limit is required';
        }
        // Check if category already has a budget
        if (!editingItem && budgets.some(b => b.category === formData.category)) {
            newErrors.category = 'Budget for this category already exists';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            category: formData.category,
            limit: parseFloat(formData.limit),
            month: currentMonth
        };

        if (editingItem) {
            updateBudget(editingItem.id, data);
        } else {
            addBudget(data);
        }
        closeModal();
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                category: item.category,
                limit: item.limit.toString()
            });
        } else {
            setEditingItem(null);
            setFormData({ category: '', limit: '' });
        }
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            deleteBudget(id);
        }
    };

    const getStatusBadge = (percentage) => {
        if (percentage >= 100) return <span className="badge badge-danger">Over Budget</span>;
        if (percentage >= 90) return <span className="badge badge-danger">Critical</span>;
        if (percentage >= 70) return <span className="badge badge-warning">Warning</span>;
        return <span className="badge badge-success">On Track</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your monthly budgets</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Budget
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalBudget, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                        {formatCurrency(totalSpent, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                        {formatCurrency(totalBudget - totalSpent, currency)}
                    </p>
                </Card>
            </div>

            {/* Overall Progress */}
            {totalBudget > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Overall Budget Utilization</h3>
                        <span className="text-sm text-gray-500">
                            {calculatePercentage(totalSpent, totalBudget).toFixed(1)}%
                        </span>
                    </div>
                    <ProgressBar value={totalSpent} max={totalBudget} color="auto" size="lg" />
                </Card>
            )}

            {/* Budget List */}
            {budgetsWithSpending.length === 0 ? (
                <EmptyState
                    icon={Wallet}
                    title="No budgets set"
                    description="Create budgets to track your spending by category."
                    action={() => openModal()}
                    actionLabel="Create Budget"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgetsWithSpending.map((budget) => {
                        const percentage = calculatePercentage(budget.spent, budget.limit);
                        const remaining = budget.limit - budget.spent;

                        return (
                            <Card key={budget.id}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {budget.category}
                                        </h3>
                                        {getStatusBadge(percentage)}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal(budget)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget.id)}
                                            className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <ProgressBar value={budget.spent} max={budget.limit} color="auto" />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Spent: {formatCurrency(budget.spent, currency)}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Limit: {formatCurrency(budget.limit, currency)}
                                    </span>
                                </div>

                                <div className={`mt-2 text-sm font-medium ${remaining >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                    {remaining >= 0
                                        ? `${formatCurrency(remaining, currency)} remaining`
                                        : `${formatCurrency(Math.abs(remaining), currency)} over budget`
                                    }
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Budget' : 'Add Budget'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Category"
                        name="category"
                        options={categories}
                        value={formData.category}
                        onChange={handleChange}
                        error={errors.category}
                        disabled={!!editingItem}
                    />
                    <Input
                        label="Budget Limit"
                        name="limit"
                        type="number"
                        placeholder="Enter budget limit"
                        value={formData.limit}
                        onChange={handleChange}
                        error={errors.limit}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth>
                            {editingItem ? 'Update' : 'Create'} Budget
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
