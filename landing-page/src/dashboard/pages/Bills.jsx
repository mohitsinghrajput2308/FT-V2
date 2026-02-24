import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, daysUntil } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';

const billCategories = [
    { value: 'Housing', label: 'Housing' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health' },
    { value: 'Other', label: 'Other' }
];

const recurringOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Yearly', label: 'Yearly' },
    { value: 'One-time', label: 'One-time' }
];

const Bills = () => {
    const { bills, addBill, updateBill, deleteBill, markBillPaid, currency, dateFormat } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        recurring: 'Monthly'
    });
    const [errors, setErrors] = useState({});

    const filteredBills = useMemo(() => {
        let filtered = [...bills];

        if (filter === 'pending') {
            filtered = filtered.filter(b => !b.isPaid);
        } else if (filter === 'paid') {
            filtered = filtered.filter(b => b.isPaid);
        } else if (filter === 'overdue') {
            filtered = filtered.filter(b => !b.isPaid && daysUntil(b.dueDate) < 0);
        }

        return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [bills, filter]);

    const stats = useMemo(() => ({
        total: bills.length,
        pending: bills.filter(b => !b.isPaid).length,
        overdue: bills.filter(b => !b.isPaid && daysUntil(b.dueDate) < 0).length,
        totalPending: bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0)
    }), [bills]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Bill name is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (!formData.category) newErrors.category = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            name: formData.name,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            category: formData.category,
            recurring: formData.recurring
        };

        if (editingItem) {
            updateBill(editingItem.id, data);
        } else {
            addBill(data);
        }
        closeModal();
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                amount: item.amount.toString(),
                dueDate: item.dueDate,
                category: item.category,
                recurring: item.recurring
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                amount: '',
                dueDate: '',
                category: '',
                recurring: 'Monthly'
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
        if (window.confirm('Delete this bill reminder?')) {
            deleteBill(id);
        }
    };

    const getBillStatus = (bill) => {
        if (bill.isPaid) {
            return { label: 'Paid', color: 'badge-success', icon: CheckCircle };
        }
        const days = daysUntil(bill.dueDate);
        if (days < 0) {
            return { label: 'Overdue', color: 'badge-danger', icon: AlertTriangle };
        }
        if (days <= 7) {
            return { label: 'Due Soon', color: 'badge-warning', icon: Clock };
        }
        return { label: 'Upcoming', color: 'badge-primary', icon: Clock };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Reminders</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your upcoming bills</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Bill
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:ring-2 ring-primary-500" onClick={() => setFilter('all')}>
                    <p className="text-sm text-gray-500">Total Bills</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </Card>
                <Card className="cursor-pointer hover:ring-2 ring-warning-500" onClick={() => setFilter('pending')}>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
                </Card>
                <Card className="cursor-pointer hover:ring-2 ring-danger-500" onClick={() => setFilter('overdue')}>
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-danger-600">{stats.overdue}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Amount Due</p>
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalPending, currency)}</p>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'paid', 'overdue'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-400'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Bills List */}
            {filteredBills.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No bills found"
                    description={filter === 'all' ? 'Add your first bill reminder to get started.' : 'No bills match this filter.'}
                    action={filter === 'all' ? () => openModal() : undefined}
                    actionLabel="Add Bill"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBills.map((bill) => {
                        const status = getBillStatus(bill);
                        const days = daysUntil(bill.dueDate);
                        const StatusIcon = status.icon;

                        return (
                            <Card key={bill.id} className={bill.isPaid ? 'opacity-75' : ''}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bill.isPaid ? 'bg-success-100 dark:bg-success-900/30' :
                                                days < 0 ? 'bg-danger-100 dark:bg-danger-900/30' :
                                                    'bg-primary-100 dark:bg-primary-900/30'
                                            }`}>
                                            <StatusIcon className={`w-5 h-5 ${bill.isPaid ? 'text-success-600' :
                                                    days < 0 ? 'text-danger-600' :
                                                        'text-primary-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{bill.name}</h3>
                                            <span className={`badge ${status.color}`}>{status.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openModal(bill)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(bill.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(bill.amount, currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Due Date</span>
                                        <span className="text-gray-900 dark:text-white">{formatDate(bill.dueDate, dateFormat)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Recurring</span>
                                        <span className="text-gray-900 dark:text-white">{bill.recurring}</span>
                                    </div>
                                </div>

                                {!bill.isPaid && (
                                    <Button
                                        onClick={() => markBillPaid(bill.id)}
                                        variant="success"
                                        fullWidth
                                        className="mt-4"
                                        icon={CheckCircle}
                                    >
                                        Mark as Paid
                                    </Button>
                                )}

                                {bill.isPaid && bill.paidDate && (
                                    <p className="mt-4 text-sm text-center text-success-600">
                                        Paid on {formatDate(bill.paidDate, dateFormat)}
                                    </p>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Bill' : 'Add Bill'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Bill Name" name="name" placeholder="e.g., Electricity Bill" value={formData.name} onChange={handleChange} error={errors.name} />
                    <Input label="Amount" name="amount" type="number" placeholder="Enter amount" value={formData.amount} onChange={handleChange} error={errors.amount} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} />
                        <Select label="Category" name="category" options={billCategories} value={formData.category} onChange={handleChange} error={errors.category} />
                    </div>
                    <Select label="Recurring" name="recurring" options={recurringOptions} value={formData.recurring} onChange={handleChange} />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>Cancel</Button>
                        <Button type="submit" fullWidth>{editingItem ? 'Update' : 'Add'} Bill</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bills;
