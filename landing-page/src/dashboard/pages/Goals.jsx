import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, PlusCircle, Trophy } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, calculatePercentage, daysUntil } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import ProgressBar from '../components/Common/ProgressBar';
import EmptyState from '../components/Common/EmptyState';

const priorities = [
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
];

const Goals = () => {
    const { goals, addGoal, updateGoal, deleteGoal, addToGoal, currency, dateFormat } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);
    const [addMoneyModal, setAddMoneyModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        priority: 'Medium',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const sortedGoals = [...goals].sort((a, b) => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Goal name is required';
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
            newErrors.targetAmount = 'Valid target amount is required';
        }
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            name: formData.name,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount) || 0,
            deadline: formData.deadline,
            priority: formData.priority,
            description: formData.description
        };

        if (editingItem) {
            updateGoal(editingItem.id, data);
        } else {
            addGoal(data);
        }
        closeModal();
    };

    const handleAddMoney = () => {
        if (selectedGoal && addAmount && parseFloat(addAmount) > 0) {
            addToGoal(selectedGoal.id, parseFloat(addAmount));
            setAddMoneyModal(false);
            setSelectedGoal(null);
            setAddAmount('');
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                targetAmount: item.targetAmount.toString(),
                currentAmount: item.currentAmount.toString(),
                deadline: item.deadline,
                priority: item.priority,
                description: item.description || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                targetAmount: '',
                currentAmount: '',
                deadline: '',
                priority: 'Medium',
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
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(id);
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            High: 'badge-danger',
            Medium: 'badge-warning',
            Low: 'badge-primary'
        };
        return <span className={`badge ${colors[priority]}`}>{priority}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your savings progress</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Goal
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Goals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved</p>
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                        {formatCurrency(totalSaved, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed Goals</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {completedGoals} / {goals.length}
                    </p>
                </Card>
            </div>

            {/* Goals List */}
            {sortedGoals.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title="No savings goals"
                    description="Set financial goals and track your progress towards achieving them."
                    action={() => openModal()}
                    actionLabel="Create Goal"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGoals.map((goal) => {
                        const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
                        const isCompleted = percentage >= 100;
                        const days = daysUntil(goal.deadline);

                        return (
                            <Card key={goal.id} className={isCompleted ? 'ring-2 ring-success-500' : ''}>
                                {isCompleted && (
                                    <div className="flex items-center gap-2 mb-3 text-success-600 dark:text-success-400">
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-medium">Goal Completed! 🎉</span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                        {getPriorityBadge(goal.priority)}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setAddMoneyModal(true);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-success-50 dark:hover:bg-success-900/20 text-success-500"
                                            disabled={isCompleted}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal(goal)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {goal.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{goal.description}</p>
                                )}

                                <div className="mb-2">
                                    <ProgressBar
                                        value={goal.currentAmount}
                                        max={goal.targetAmount}
                                        color={isCompleted ? 'success' : 'primary'}
                                        showLabel
                                    />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {formatCurrency(goal.currentAmount, currency)}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(goal.targetAmount, currency)}
                                    </span>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-300">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                                        <span className={`font-medium ${days < 0 ? 'text-danger-600' : days < 30 ? 'text-warning-600' : 'text-gray-900 dark:text-white'}`}>
                                            {formatDate(goal.deadline, dateFormat)}
                                            {days > 0 && ` (${days} days left)`}
                                            {days < 0 && ' (Overdue)'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Goal' : 'Create Goal'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Goal Name"
                        name="name"
                        placeholder="e.g., Emergency Fund"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Target Amount"
                            name="targetAmount"
                            type="number"
                            placeholder="Target"
                            value={formData.targetAmount}
                            onChange={handleChange}
                            error={errors.targetAmount}
                        />
                        <Input
                            label="Current Amount"
                            name="currentAmount"
                            type="number"
                            placeholder="Saved so far"
                            value={formData.currentAmount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Deadline"
                            name="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={handleChange}
                            error={errors.deadline}
                        />
                        <Select
                            label="Priority"
                            name="priority"
                            options={priorities}
                            value={formData.priority}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="label">Description (Optional)</label>
                        <textarea
                            name="description"
                            rows={2}
                            className="input"
                            placeholder="Describe your goal..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth>
                            {editingItem ? 'Update' : 'Create'} Goal
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Money Modal */}
            <Modal isOpen={addMoneyModal} onClose={() => setAddMoneyModal(false)} title="Add Money to Goal" size="sm">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Add funds to <span className="font-semibold">{selectedGoal?.name}</span>
                    </p>
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="Enter amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setAddMoneyModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button onClick={handleAddMoney} fullWidth>
                            Add Money
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Goals;
