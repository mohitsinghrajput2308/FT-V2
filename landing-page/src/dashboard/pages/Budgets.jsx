import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Settings, AlertTriangle, PiggyBank } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, calculatePercentage, getCurrentMonth } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import ProgressBar from '../components/Common/ProgressBar';
import EmptyState from '../components/Common/EmptyState';

const defaultCategories = [
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
    const { budgets, addBudget, updateBudget, deleteBudget, transactions, currency, settings, updateSettings } = useFinance();

    // ── Master total budget (envelope) ────────────────────────────
    const masterTotal = parseFloat(settings.totalBudget || 0);

    // ── Category state ────────────────────────────────────────────
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ category: '', customCategory: '', limit: '', spent: '' });
    const [formErrors, setFormErrors] = useState({});
    const [deletingId, setDeletingId] = useState(null);

    // ── Master budget modal ───────────────────────────────────────
    const [masterModalOpen, setMasterModalOpen] = useState(false);
    const [masterInput, setMasterInput] = useState('');
    const [masterError, setMasterError] = useState('');

    // ── Derived totals ────────────────────────────────────────────
    const totalAllocated = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalUnallocated = masterTotal - totalAllocated;

    // ── Categories dropdown ───────────────────────────────────────
    const categories = useMemo(() => {
        const uniqueCats = new Set(defaultCategories.map(c => c.value));
        transactions.filter(t => t.type === 'expense').forEach(t => { if (t.category) uniqueCats.add(t.category); });
        budgets.forEach(b => { if (b.category) uniqueCats.add(b.category); });
        return [...Array.from(uniqueCats).filter(c => c !== 'Other').sort().map(c => ({ value: c, label: c })),
                { value: 'Other', label: 'Other' }];
    }, [transactions, budgets]);

    // ── Master budget ─────────────────────────────────────────────
    const openMasterModal = () => {
        setMasterInput(masterTotal > 0 ? masterTotal.toString() : '');
        setMasterError('');
        setMasterModalOpen(true);
    };
    const saveMasterBudget = async () => {
        const val = parseFloat(masterInput);
        if (!masterInput || isNaN(val) || val <= 0) {
            setMasterError('Please enter a valid amount greater than 0');
            return;
        }
        if (val < totalAllocated) {
            setMasterError(`Cannot set below already allocated amount (${formatCurrency(totalAllocated, currency)}). Reduce category budgets first.`);
            return;
        }
        await updateSettings({ totalBudget: val });
        setMasterModalOpen(false);
    };

    // ── Category CRUD ─────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateCategory = () => {
        const errs = {};
        if (!formData.category.trim()) errs.category = 'Please select a category';
        if (formData.category === 'Other' && !formData.customCategory?.trim()) errs.customCategory = 'Please specify the category';

        const limitVal = parseFloat(formData.limit);
        if (!formData.limit || isNaN(limitVal) || limitVal <= 0) {
            errs.limit = 'Allocation must be greater than 0';
        } else if (masterTotal > 0) {
            // How much is already allocated excluding the item being edited
            const currentAlloc = budgets.reduce((sum, b) => (!editingItem || b.id !== editingItem.id) ? sum + (b.amount || 0) : sum, 0);
            if (currentAlloc + limitVal > masterTotal) {
                const available = masterTotal - currentAlloc;
                errs.limit = available <= 0
                    ? `Total budget of ${formatCurrency(masterTotal, currency)} is fully allocated. Adjust existing categories or increase total budget.`
                    : `Only ${formatCurrency(available, currency)} unallocated. Reduce amount or increase total budget.`;
            }
        }
        const spentVal = formData.spent === '' ? 0 : parseFloat(formData.spent);
        if (formData.spent !== '' && (isNaN(spentVal) || spentVal < 0)) errs.spent = 'Spent amount must be 0 or more';

        const finalCat = formData.category === 'Other' && formData.customCategory?.trim()
            ? formData.customCategory.trim() : formData.category;
        if (finalCat && budgets.some(b => b.category.toLowerCase() === finalCat.toLowerCase() && (!editingItem || b.id !== editingItem.id))) {
            errs.category = `A budget for "${finalCat}" already exists`;
        }
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateCategory()) return;
        const data = {
            category: formData.category === 'Other' && formData.customCategory?.trim() ? formData.customCategory.trim() : formData.category,
            amount: parseFloat(formData.limit),
            spent: formData.spent === '' ? 0 : parseFloat(formData.spent),
            month: getCurrentMonth(), // required by DB schema
        };
        if (editingItem) updateBudget(editingItem.id, data);
        else addBudget(data);
        closeModal();
    };

    const openModal = (item = null) => {
        if (item) {
            const isCustom = !defaultCategories.some(c => c.value === item.category);
            setEditingItem(item);
            setFormData({
                category: isCustom ? 'Other' : item.category,
                customCategory: isCustom ? item.category : '',
                limit: item.amount?.toString() ?? '',
                spent: item.spent != null ? item.spent.toString() : '0'
            });
        } else {
            setEditingItem(null);
            setFormData({ category: '', customCategory: '', limit: '', spent: '' });
        }
        setFormErrors({});
        setCategoryModalOpen(true);
    };

    const closeModal = () => { setCategoryModalOpen(false); setEditingItem(null); };
    const confirmDelete = (id) => setDeletingId(id);
    const cancelDelete = () => setDeletingId(null);
    const handleDelete = () => { if (deletingId) { deleteBudget(deletingId); setDeletingId(null); } };

    const getStatusBadge = (pct) => {
        if (pct >= 100) return <span className="badge badge-danger">Over Limit</span>;
        if (pct >= 90)  return <span className="badge badge-danger">Critical</span>;
        if (pct >= 70)  return <span className="badge badge-warning">Warning</span>;
        return <span className="badge badge-success">On Track</span>;
    };

    // ── Envelope status ───────────────────────────────────────────
    const isOverAllocated = masterTotal > 0 && totalAllocated > masterTotal;
    const isFullyAllocated = masterTotal > 0 && totalUnallocated <= 0;
    const canAddBudget = masterTotal === 0 || !isFullyAllocated;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {masterTotal > 0
                            ? `Allocating ${formatCurrency(totalAllocated, currency)} of ${formatCurrency(masterTotal, currency)} total budget`
                            : 'Set a total budget to start allocating across categories'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={openMasterModal} variant="secondary" icon={Settings}>
                        {masterTotal > 0 ? 'Edit Total Budget' : 'Set Total Budget'}
                    </Button>
                    {canAddBudget ? (
                        <Button onClick={() => openModal()} icon={Plus}>
                            Add Category
                        </Button>
                    ) : (
                        <Button
                            onClick={() => openModal()}
                            icon={Plus}
                            title="Total budget fully allocated"
                            className="opacity-60 cursor-not-allowed"
                            disabled
                        >
                            Add Category
                        </Button>
                    )}
                </div>
            </div>

            {/* Over-allocated warning */}
            {isOverAllocated && (
                <div className="flex items-start gap-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-danger-700 dark:text-danger-300">Category allocations exceed total budget</p>
                        <p className="text-sm text-danger-600 dark:text-danger-400 mt-0.5">
                            You've allocated {formatCurrency(totalAllocated, currency)} but your total budget is only {formatCurrency(masterTotal, currency)}.
                            Reduce some category limits or increase the total budget.
                        </p>
                    </div>
                </div>
            )}

            {/* Fully allocated notice */}
            {isFullyAllocated && !isOverAllocated && (
                <div className="flex items-start gap-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-warning-700 dark:text-warning-300">Total budget fully allocated</p>
                        <p className="text-sm text-warning-600 dark:text-warning-400 mt-0.5">
                            To add a new category budget, either adjust existing category limits or increase your total budget.
                        </p>
                    </div>
                </div>
            )}

            {/* Envelope summary */}
            {masterTotal > 0 && (
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Total Budget Envelope</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(totalAllocated, currency)} allocated
                            {totalUnallocated > 0 && <> · <span className="text-success-600 dark:text-success-400">{formatCurrency(totalUnallocated, currency)} free</span></>}
                            {totalUnallocated < 0 && <> · <span className="text-danger-600 dark:text-danger-400">{formatCurrency(Math.abs(totalUnallocated), currency)} over</span></>}
                        </span>
                    </div>
                    <ProgressBar value={totalAllocated} max={masterTotal} color="auto" size="lg" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-dark-400">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Budget</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(masterTotal, currency)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Allocated</p>
                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(totalAllocated, currency)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Spent</p>
                            <p className="text-lg font-bold text-danger-600 dark:text-danger-400">{formatCurrency(totalSpent, currency)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remaining</p>
                            <p className={`text-lg font-bold ${masterTotal - totalSpent >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                                {formatCurrency(masterTotal - totalSpent, currency)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* No master budget set yet */}
            {masterTotal === 0 && budgets.length === 0 && (
                <EmptyState
                    icon={PiggyBank}
                    title="Start with a total budget"
                    description='Click "Set Total Budget" to define your spending envelope, then add category budgets within it.'
                    action={openMasterModal}
                    actionLabel="Set Total Budget"
                />
            )}

            {/* Category rows */}
            {budgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((budget, idx) => {
                        const spent = budget.spent || 0;
                        const remaining = budget.amount - spent;
                        const pct = calculatePercentage(spent, budget.amount);
                        const isDeleting = deletingId === budget.id;
                        // Show how much this category's limit is of the master total
                        const allocationPctOfMaster = masterTotal > 0 ? ((budget.amount / masterTotal) * 100).toFixed(1) : null;

                        return (
                            <Card key={budget.id}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                                            {budget.category}
                                            {allocationPctOfMaster && (
                                                <span className="text-xs bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
                                                    {allocationPctOfMaster}% of total
                                                </span>
                                            )}
                                        </h3>
                                        {getStatusBadge(pct)}
                                    </div>
                                    <div className="flex gap-1">
                                        {!isDeleting ? (
                                            <>
                                                <button onClick={() => openModal(budget)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => confirmDelete(budget.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-500" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Delete?</span>
                                                <button onClick={handleDelete} className="px-2 py-1 text-xs font-semibold bg-danger-600 hover:bg-danger-700 text-white rounded-md">Yes</button>
                                                <button onClick={cancelDelete} className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-md">No</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <ProgressBar value={spent} max={budget.amount} color="auto" />

                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-500 dark:text-gray-400">Spent: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(spent, currency)}</span></span>
                                    <span className="text-gray-500 dark:text-gray-400">Limit: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(budget.amount, currency)}</span></span>
                                </div>

                                <div className={`mt-2 text-sm font-semibold ${remaining >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                                    {remaining >= 0
                                        ? `${formatCurrency(remaining, currency)} remaining`
                                        : `${formatCurrency(Math.abs(remaining), currency)} over limit`}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ── Set Total Budget Modal ── */}
            <Modal isOpen={masterModalOpen} onClose={() => setMasterModalOpen(false)} title="Set Total Budget">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        This is the total spending envelope for the period. All category budgets must fit within this amount.
                    </p>
                    {totalAllocated > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                            Currently allocated across categories: <strong>{formatCurrency(totalAllocated, currency)}</strong>. Total budget must be at least this much.
                        </div>
                    )}
                    <Input
                        label="Total Budget Amount"
                        type="number"
                        placeholder="e.g. 25000"
                        min="0.01"
                        step="0.01"
                        value={masterInput}
                        onChange={e => { setMasterInput(e.target.value); setMasterError(''); }}
                        error={masterError}
                        autoFocus
                    />
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setMasterModalOpen(false)} fullWidth>Cancel</Button>
                        <Button type="button" onClick={saveMasterBudget} fullWidth>Save</Button>
                    </div>
                </div>
            </Modal>

            {/* ── Add / Edit Category Modal ── */}
            <Modal isOpen={categoryModalOpen} onClose={closeModal} title={editingItem ? 'Edit Category Budget' : 'Add Category Budget'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {masterTotal > 0 && (
                        <div className="bg-gray-50 dark:bg-dark-300 rounded-lg px-4 py-3 text-sm flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Unallocated remaining</span>
                            <span className={`font-semibold ${totalUnallocated > 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                                {formatCurrency(editingItem ? totalUnallocated + (editingItem.amount || 0) : totalUnallocated, currency)}
                            </span>
                        </div>
                    )}
                    <Select
                        label="Category"
                        name="category"
                        options={categories}
                        value={formData.category}
                        onChange={handleChange}
                        error={formErrors.category}
                        disabled={!!editingItem}
                    />
                    {formData.category === 'Other' && (
                        <Input
                            label="Specify Category"
                            name="customCategory"
                            placeholder="e.g. Pet Care"
                            value={formData.customCategory}
                            onChange={handleChange}
                            error={formErrors.customCategory}
                            disabled={!!editingItem}
                        />
                    )}
                    <Input
                        label="Allocated Limit"
                        name="limit"
                        type="number"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={formData.limit}
                        onChange={handleChange}
                        error={formErrors.limit}
                    />
                    <Input
                        label="Already Spent (optional)"
                        name="spent"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formData.spent}
                        onChange={handleChange}
                        error={formErrors.spent}
                    />
                    {formData.limit && formData.spent !== '' && !formErrors.limit && !formErrors.spent && (
                        <p className={`text-sm font-medium ${parseFloat(formData.limit) - parseFloat(formData.spent || 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                            {parseFloat(formData.limit) - parseFloat(formData.spent || 0) >= 0
                                ? `${formatCurrency(parseFloat(formData.limit) - parseFloat(formData.spent || 0), currency)} will remain in this category`
                                : `${formatCurrency(Math.abs(parseFloat(formData.limit) - parseFloat(formData.spent || 0)), currency)} over category limit`}
                        </p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>Cancel</Button>
                        <Button type="submit" fullWidth>{editingItem ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;