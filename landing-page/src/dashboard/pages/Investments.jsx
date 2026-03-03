import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';
import PortfolioChart from '../components/Charts/PortfolioChart';

const investmentTypes = [
    { value: 'Stocks', label: 'Stocks' },
    { value: 'Mutual Funds', label: 'Mutual Funds' },
    { value: 'Crypto', label: 'Cryptocurrency' },
    { value: 'Gold', label: 'Gold' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Bonds', label: 'Bonds' },
    { value: 'ETF', label: 'ETF' },
    { value: 'Other', label: 'Other' },
];

const Investments = () => {
    const { investments, addInvestment, updateInvestment, deleteInvestment, currency, dateFormat } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        customType: '',
        purchasePrice: '',
        currentValue: '',
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    const stats = useMemo(() => {
        const totalInvested = investments.reduce((sum, i) => sum + i.purchasePrice * i.quantity, 0);
        const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue * i.quantity, 0);
        const totalProfitLoss = totalCurrentValue - totalInvested;
        const percentageChange = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
        return { totalInvested, totalCurrentValue, totalProfitLoss, percentageChange };
    }, [investments]);

    const portfolioData = useMemo(() => {
        const byType = investments.reduce((acc, i) => {
            const value = i.currentValue * i.quantity;
            acc[i.type] = (acc[i.type] || 0) + value;
            return acc;
        }, {});
        return Object.entries(byType).map(([name, value]) => ({ name, value }));
    }, [investments]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Investment name is required';
        if (!formData.type) newErrors.type = 'Type is required';
        if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
            newErrors.purchasePrice = 'Valid purchase price is required';
        }
        if (!formData.currentValue || parseFloat(formData.currentValue) <= 0) {
            newErrors.currentValue = 'Valid current value is required';
        }
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            name: formData.name,
            type: formData.type === 'Other'
                ? (formData.customType.trim() || 'Other')
                : formData.type,
            purchasePrice: parseFloat(formData.purchasePrice),
            currentValue: parseFloat(formData.currentValue),
            quantity: parseFloat(formData.quantity),
            purchaseDate: formData.purchaseDate
        };

        if (editingItem) {
            updateInvestment(editingItem.id, data);
        } else {
            addInvestment(data);
        }
        closeModal();
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                type: item.type,
                customType: '',
                purchasePrice: item.purchasePrice.toString(),
                currentValue: item.currentValue.toString(),
                quantity: item.quantity.toString(),
                purchaseDate: item.purchaseDate
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                type: '',
                customType: '',
                purchasePrice: '',
                currentValue: '',
                quantity: '',
                purchaseDate: new Date().toISOString().split('T')[0]
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
        if (window.confirm('Are you sure you want to delete this investment?')) {
            deleteInvestment(id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your investment portfolio</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>
                    Add Investment
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalInvested, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(stats.totalCurrentValue, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total P/L</p>
                    <p className={`text-2xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {stats.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalProfitLoss, currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Return %</p>
                    <div className={`flex items-center gap-2 ${stats.percentageChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {stats.percentageChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        <span className="text-2xl font-bold">
                            {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange.toFixed(2)}%
                        </span>
                    </div>
                </Card>
            </div>

            {investments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Portfolio Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Portfolio Distribution
                        </h3>
                        <PortfolioChart data={portfolioData} height={280} currency={currency} />
                    </Card>

                    {/* Investment List */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Your Investments
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {investments.map((inv) => {
                                const invested = inv.purchasePrice * inv.quantity;
                                const current = inv.currentValue * inv.quantity;
                                const pl = current - invested;
                                const plPercent = (pl / invested) * 100;

                                return (
                                    <div
                                        key={inv.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{inv.name}</p>
                                                <p className="text-sm text-gray-500">{inv.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(current, currency)}
                                            </p>
                                            <p className={`text-sm ${pl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                                {pl >= 0 ? '+' : ''}{plPercent.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Full Investment Table */}
            {investments.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No investments"
                    description="Start tracking your investments to monitor your portfolio performance."
                    action={() => openModal()}
                    actionLabel="Add Investment"
                />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Investment</th>
                                <th>Type</th>
                                <th>Qty</th>
                                <th>Buy Price</th>
                                <th>Current</th>
                                <th>P/L</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map((inv) => {
                                const invested = inv.purchasePrice * inv.quantity;
                                const current = inv.currentValue * inv.quantity;
                                const pl = current - invested;

                                return (
                                    <tr key={inv.id}>
                                        <td>
                                            <p className="font-medium text-gray-900 dark:text-white">{inv.name}</p>
                                            <p className="text-sm text-gray-500">{formatDate(inv.purchaseDate, dateFormat)}</p>
                                        </td>
                                        <td><span className="badge badge-primary">{inv.type}</span></td>
                                        <td>{inv.quantity}</td>
                                        <td>{formatCurrency(inv.purchasePrice, currency)}</td>
                                        <td>{formatCurrency(inv.currentValue, currency)}</td>
                                        <td className={pl >= 0 ? 'text-success-600 font-semibold' : 'text-danger-600 font-semibold'}>
                                            {pl >= 0 ? '+' : ''}{formatCurrency(pl, currency)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openModal(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Investment' : 'Add Investment'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Investment Name" name="name" placeholder="e.g., Reliance Industries" value={formData.name} onChange={handleChange} error={errors.name} />
                    <Select label="Type" name="type" options={investmentTypes} value={formData.type} onChange={handleChange} error={errors.type} />
                    {formData.type === 'Other' && (
                        <Input
                            label="Specify Type"
                            name="customType"
                            placeholder="e.g., Real Assets, REIT, Commodities..."
                            value={formData.customType}
                            onChange={handleChange}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Purchase Price" name="purchasePrice" type="number" step="0.01" placeholder="Price per unit" value={formData.purchasePrice} onChange={handleChange} error={errors.purchasePrice} />
                        <Input label="Current Value" name="currentValue" type="number" step="0.01" placeholder="Current price" value={formData.currentValue} onChange={handleChange} error={errors.currentValue} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" name="quantity" type="number" step="0.001" placeholder="Units" value={formData.quantity} onChange={handleChange} error={errors.quantity} />
                        <Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} error={errors.purchaseDate} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>Cancel</Button>
                        <Button type="submit" fullWidth>{editingItem ? 'Update' : 'Add'} Investment</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Investments;