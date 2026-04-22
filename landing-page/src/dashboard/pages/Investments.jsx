import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Briefcase, Zap, Lock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useSubscription } from '../../hooks/useSubscription';
import { formatCurrency, formatDate } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';
import PortfolioChart from '../components/Charts/PortfolioChart';
import MarketWatch from '../components/Investments/MarketWatch';
import AssetSelector from '../components/Investments/AssetSelector';
import PriceDisplay from '../components/Investments/PriceDisplay';
import usePriceUpdater from '../hooks/usePriceUpdater';

// Types that support the built-in asset picker
const ASSET_PICKER_TYPES = new Set(['Stocks', 'Funds', 'Futures', 'Forex', 'Crypto', 'Indices', 'Bonds', 'Economy', 'Options', 'Commodity']);

const investmentTypes = [
    { value: 'Stocks',    label: 'Stocks' },
    { value: 'Funds',     label: 'Funds' },
    { value: 'Futures',   label: 'Futures' },
    { value: 'Forex',     label: 'Forex' },
    { value: 'Crypto',    label: 'Crypto' },
    { value: 'Indices',   label: 'Indices' },
    { value: 'Bonds',     label: 'Bonds' },
    { value: 'Economy',   label: 'Economy' },
    { value: 'Options',   label: 'Options' },
    { value: 'Commodity', label: 'Commodity' },
    { value: 'Other',     label: 'Other' },
];

const emptyForm = () => ({
    name:          '',
    type:          '',
    customType:    '',
    purchasePrice: '',
    currentValue:  '',   // managed by live poller when symbol exists
    quantity:      '',
    purchaseDate:  new Date().toISOString().split('T')[0],
});

const Investments = () => {
    const { investments, addInvestment, updateInvestment, updateInvestmentPrice, deleteInvestment, currency, dateFormat } = useFinance();
    const { isPro, isBusiness } = useSubscription();
    const navigate = useNavigate();
    const [activeTab,    setActiveTab]    = useState('portfolio');
    const [modalOpen,    setModalOpen]    = useState(false);
    const [limitModal,   setLimitModal]   = useState(false);
    const [editingItem,  setEditingItem]  = useState(null);
    const [errors,       setErrors]       = useState({});
    const [formData,     setFormData]     = useState(emptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualOverride, setManualOverride] = useState(false);
    const [filterType,   setFilterType]   = useState('All');
    const [chartMode,    setChartMode]    = useState('profit'); // 'profit' | 'loss' | 'invested' | 'value'

    // ── Asset picker state ─────────────────────────────────────────────────
    const [selectedAsset, setSelectedAsset] = useState(null); // asset obj from STOCK_FOREX_UNIVERSE

    // live price polling — only active when a known symbol is picked
    const { price: livePrice, change: liveChange, isLoading: priceLoading, error: priceError, lastUpdated, refetch } =
        usePriceUpdater(selectedAsset?.symbol ?? null, 10000);

    // When live price arrives, sync currentValue (but NOT purchasePrice — that stays fixed at buy-time)
    useEffect(() => {
        if (livePrice != null && selectedAsset && !manualOverride) {
            setFormData(prev => ({ ...prev, currentValue: livePrice.toString() }));
        }
    }, [livePrice, selectedAsset, manualOverride]);

    // ── REAL-TIME PORTFOLIO PRICE UPDATES ──────────────────────────────────
    // Keep a ref of investments so the polling interval can always read the
    // latest snapshot without needing 'investments' as a dep (avoids infinite loop).
    const investmentsRef = useRef(investments);
    useEffect(() => { investmentsRef.current = investments; }, [investments]);

    const updateInvestmentRef = useRef(updateInvestmentPrice);
    useEffect(() => { updateInvestmentRef.current = updateInvestmentPrice; }, [updateInvestmentPrice]);

    const pollPortfolioPrices = useCallback(async () => {
        const current = investmentsRef.current;
        const symbolInvestments = current.filter(inv => inv.symbol);
        if (symbolInvestments.length === 0) return;

        try {
            const symbols = [...new Set(symbolInvestments.map(inv => inv.symbol))];
            const res = await fetch(`/api/quote?symbols=${symbols.join(',')}`);
            if (!res.ok) return;

            const data = await res.json();
            const quotes = data.quoteResponse?.result || [];

            quotes.forEach(quote => {
                if (!quote.regularMarketPrice) return;
                symbolInvestments
                    .filter(inv => inv.symbol === quote.symbol)
                    .forEach(inv => {
                        // Optimistic update — UI reflects instantly, DB syncs in background
                        updateInvestmentRef.current(inv.id, quote.regularMarketPrice);
                    });
            });
        } catch (err) {
            console.debug('Portfolio price update failed:', err);
        }
    }, []); // stable — uses refs internally

    // Run once on mount, then poll every 5s for near-real-time prices
    useEffect(() => {
        pollPortfolioPrices();
        const id = setInterval(pollPortfolioPrices, 5000);
        return () => clearInterval(id);
    }, [pollPortfolioPrices]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const totalInvested      = investments.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
        const totalCurrentValue  = investments.reduce((s, i) => s + i.currentValue  * i.quantity, 0);
        const totalProfitLoss    = totalCurrentValue - totalInvested;
        const percentageChange   = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
        return { totalInvested, totalCurrentValue, totalProfitLoss, percentageChange };
    }, [investments]);

    const portfolioData = useMemo(() => {
        // Which investments to source from (all, or filtered by category)
        const source = filterType === 'All' ? investments : investments.filter(i => i.type === filterType);
        // Group key: by name when a category is selected, by type when showing All
        const key = (i) => filterType === 'All' ? i.type : i.name;

        const result = source.reduce((acc, i) => {
            const invested = i.purchasePrice * i.quantity;
            const current  = i.currentValue  * i.quantity;
            const profit   = current - invested;
            const loss     = invested - current; // positive means in loss

            let value = 0;
            if (chartMode === 'profit')   value = profit > 0 ? profit : 0;
            if (chartMode === 'loss')     value = loss  > 0 ? loss   : 0;
            if (chartMode === 'invested') value = invested;

            if (value > 0) acc[key(i)] = (acc[key(i)] || 0) + value;
            return acc;
        }, {});

        return Object.entries(result).map(([name, value]) => ({ name, value }));
    }, [investments, filterType, chartMode]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (name === 'currentValue') setManualOverride(true);
    };

    // When asset type changes — clear picked asset and reset price fields
    const handleTypeChange = (e) => {
        const type = e.target.value;
        setSelectedAsset(null);
        setManualOverride(false);
        setFormData(prev => ({ ...prev, type, name: '', purchasePrice: '', currentValue: '' }));
        if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
    };

    // When user picks an asset from the selector
    const handleAssetSelect = (asset) => {
        if (!asset) {
            setSelectedAsset(null);
            setManualOverride(false);
            setFormData(prev => ({ ...prev, name: '', purchasePrice: '', currentValue: '' }));
            return;
        }
        setSelectedAsset(asset);
        setManualOverride(false);
        const px = asset.price > 0 ? asset.price.toString() : '';
        setFormData(prev => ({
            ...prev,
            name:          asset.name || asset.symbol,
            purchasePrice: '',   // DO NOT AUTO-FILL. User must enter manually.
            currentValue:  px,   // will be replaced by live price as soon as hook fires
        }));
    };

    const validate = () => {
        const e = {};
        if (!formData.name.trim())                                          e.name          = 'Investment name is required';
        if (!formData.type)                                                  e.type          = 'Type is required';
        if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) e.purchasePrice = 'Valid purchase price is required';
        // currentValue is optional when a symbol is linked (poller fills it)
        if (!selectedAsset && (!formData.currentValue || parseFloat(formData.currentValue) <= 0))
            e.currentValue = 'Valid current value is required';
        if (!formData.quantity      || parseFloat(formData.quantity)      <= 0) e.quantity      = 'Valid quantity is required';
        if (!formData.purchaseDate)                                          e.purchaseDate  = 'Purchase date is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const startTime = Date.now();
        try {
            const data = {
                name:          formData.name,
                type:          formData.type === 'Other' ? (formData.customType.trim() || 'Other') : formData.type,
                purchasePrice: parseFloat(formData.purchasePrice),
                currentValue:  parseFloat(formData.currentValue) || parseFloat(formData.purchasePrice),
                quantity:      parseFloat(formData.quantity),
                purchaseDate:  formData.purchaseDate,
                symbol:        selectedAsset?.symbol ?? null,
            };

            if (editingItem) {
                await updateInvestment(editingItem.id, data);
                console.log('✅ Investment updated successfully');
            } else {
                await addInvestment(data);
                console.log('✅ Investment added successfully');
            }
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 500) await new Promise(r => setTimeout(r, 500 - elapsedTime));
            setIsSubmitting(false);
            closeModal();
        } catch (err) {
            console.error('❌ Investment submission error:', err);
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 800) await new Promise(r => setTimeout(r, 800 - elapsedTime));
            setIsSubmitting(false);
        }
    };

    const openModal = (item = null) => {
        setSelectedAsset(null);
        if (item) {
            setEditingItem(item);
            setFormData({
                name:          item.name,
                type:          item.type,
                customType:    '',
                purchasePrice: item.purchasePrice.toString(),
                currentValue:  item.currentValue.toString(),
                quantity:      item.quantity.toString(),
                purchaseDate:  item.purchaseDate,
            });
        } else {
            // Adding new investment — check plan limit
            if (!isPro && !isBusiness && investments.length >= 3) {
                setLimitModal(true);
                return;
            }
            setEditingItem(null);
            setFormData(emptyForm());
        }
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        setSelectedAsset(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this investment?')) {
            deleteInvestment(id);
        }
    };

    const showPicker = ASSET_PICKER_TYPES.has(formData.type);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your investment portfolio</p>
                </div>
                <Button onClick={() => openModal()} icon={Plus}>Add Investment</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalInvested, currency)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        Portfolio Value
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" title="Live" />
                    </p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(stats.totalCurrentValue, currency)}</p>
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

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-dark-400">
                {[['portfolio', 'Personal Portfolio'], ['marketWatch', 'Global Market Watch']].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === id
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-dark-300'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'portfolio' ? (
                <div className="flex flex-col gap-6">
                    {investments.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    {/* Chart Mode Tabs */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {filterType === 'All'
                                                ? { profit: 'Profit Distribution', loss: 'Loss Distribution', invested: 'Total Invested' }[chartMode]
                                                : `${filterType} — ${{ profit: 'Profits', loss: 'Losses', invested: 'Invested' }[chartMode]}`
                                            }
                                        </h3>
                                    </div>
                                    <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-dark-400/50 rounded-lg">
                                        {[
                                            { id: 'profit',   label: 'Profit',   color: 'text-success-600' },
                                            { id: 'loss',     label: 'Loss',     color: 'text-danger-600'  },
                                            { id: 'invested', label: 'Invested', color: 'text-primary-600' },
                                        ].map(({ id, label, color }) => (
                                            <button
                                                key={id}
                                                onClick={() => { setChartMode(id); setFilterType('All'); }}
                                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                                    chartMode === id
                                                        ? `bg-white dark:bg-dark-200 shadow-sm ${color}`
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    {portfolioData.length > 0 ? (
                                        <PortfolioChart data={portfolioData} height={240} currency={currency} />
                                    ) : (
                                        <div className="flex items-center justify-center h-[240px] text-gray-400 dark:text-gray-500 text-sm">
                                            No {chartMode === 'loss' ? 'losing' : 'profitable'} assets{filterType !== 'All' ? ` in ${filterType}` : ''}
                                        </div>
                                    )}
                                </Card>
                                <Card>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Investments</h3>

                                    {/* Category Filter Pills */}
                                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 hide-scrollbar">
                                        {['All', ...['Stocks', 'Funds', 'Futures', 'Forex', 'Crypto', 'Indices', 'Bonds', 'Economy', 'Options', 'Commodity', 'Other'].filter(t => {
                                                const inType = investments.filter(i => i.type === t);
                                                if (inType.length === 0) return false;
                                                if (chartMode === 'profit') return inType.some(i => (i.currentValue - i.purchasePrice) * i.quantity > 0);
                                                if (chartMode === 'loss')   return inType.some(i => (i.currentValue - i.purchasePrice) * i.quantity < 0);
                                                return true; // invested / value — show all owned types
                                            })].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                                    filterType === type
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-400/50 dark:text-gray-400 dark:hover:bg-dark-400'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                        {investments
                                            .filter(inv => filterType === 'All' || inv.type === filterType)
                                            .filter(inv => {
                                                const pl = (inv.currentValue - inv.purchasePrice) * inv.quantity;
                                                if (chartMode === 'profit') return pl > 0;
                                                if (chartMode === 'loss')   return pl < 0;
                                                return true; // invested / value — show all
                                            })
                                            .map((inv) => {
                                            const invested = inv.purchasePrice * inv.quantity;
                                            const current  = inv.currentValue  * inv.quantity;
                                            const pl       = current - invested;
                                            const plPct    = invested > 0 ? (pl / invested) * 100 : 0;
                                            return (
                                                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                            <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{inv.name.replace('=X', '')}</p>
                                                            <p className="text-sm text-gray-500">{inv.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(current, currency)}</p>
                                                        <p className={`text-sm font-medium ${pl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                                            {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>

                            {/* Full table */}
                            <div className="table-container bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-400 shadow-sm overflow-hidden">
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
                                            const current  = inv.currentValue  * inv.quantity;
                                            const pl       = current - invested;
                                            return (
                                                <tr key={inv.id}>
                                                    <td>
                                                        <p className="font-medium text-gray-900 dark:text-white">{inv.name.replace('=X', '')}</p>
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
                        </>
                    ) : (
                        <EmptyState
                            icon={Briefcase}
                            title="No investments"
                            description="Start tracking your investments to monitor your portfolio performance."
                            action={() => openModal()}
                            actionLabel="Add Investment"
                        />
                    )}
                </div>
            ) : (
                <div className="w-full"><MarketWatch /></div>
            )}

            {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Investment' : 'Add Investment'}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Investment Name */}
                    <Input
                        label="Investment Name"
                        name="name"
                        placeholder="e.g., Apple Inc., Bitcoin…"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />

                    {/* Type selector */}
                    <Select
                        label="Type"
                        name="type"
                        options={investmentTypes}
                        value={formData.type}
                        onChange={handleTypeChange}
                        error={errors.type}
                    />

                    {formData.type === 'Other' && (
                        <Input
                            label="Specify Type"
                            name="customType"
                            placeholder="e.g., REIT, Commodities…"
                            value={formData.customType}
                            onChange={handleChange}
                        />
                    )}

                    {/* Asset picker — only for supported types */}
                    {showPicker && !editingItem && (
                        <>
                            <AssetSelector
                                assetType={formData.type}
                                onSelect={handleAssetSelect}
                                selectedAsset={selectedAsset}
                            />
                            {selectedAsset && (
                                <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
                                    <Zap className="w-3.5 h-3.5" />
                                    Live price updates active — current value refreshes every 10 seconds
                                </div>
                            )}
                        </>
                    )}

                    {/* Prices */}
                    {selectedAsset && !editingItem ? (
                        /* Live price widgets */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <PriceDisplay
                                label="Purchase Price (per unit)"
                                price={formData.purchasePrice !== '' ? formData.purchasePrice : null}
                                isLoading={false}
                                onRefresh={() => {
                                    // Normally doesn't auto-fetch purchase price, but they can click refresh to fill it with current market price
                                    if (selectedAsset) {
                                        setFormData(prev => ({ ...prev, purchasePrice: livePrice?.toString() || selectedAsset.price.toString() }));
                                    }
                                }}
                                editable={true}
                                name="purchasePrice"
                                onChange={handleChange}
                                placeholder="Price at purchase"
                            />
                            <PriceDisplay
                                label="Current Value (per unit)"
                                price={formData.currentValue !== '' ? formData.currentValue : null}
                                change={liveChange}
                                isLoading={priceLoading && !manualOverride}
                                error={priceError}
                                lastUpdated={lastUpdated}
                                onRefresh={() => {
                                    setManualOverride(false);
                                    refetch();
                                }}
                                editable={!!priceError}
                                name="currentValue"
                                onChange={handleChange}
                                placeholder="Current market price"
                            />
                        </div>
                    ) : (
                        /* Manual price inputs (no asset picked, or edit mode) */
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Purchase Price" name="purchasePrice" type="text" inputMode="decimal" placeholder="Price per unit" value={formData.purchasePrice} onChange={handleChange} error={errors.purchasePrice} />
                            {/* Current Value only shown in edit mode — for symbol-linked assets it's managed by the live poller */}
                            {editingItem && (
                                <Input label="Current Value" name="currentValue" type="text" inputMode="decimal" placeholder="Current price" value={formData.currentValue} onChange={handleChange} error={errors.currentValue} />
                            )}
                        </div>
                    )}
                    {errors.purchasePrice && !selectedAsset && <p className="text-xs text-danger-600">{errors.purchasePrice}</p>}
                    {errors.currentValue  && !selectedAsset && <p className="text-xs text-danger-600">{errors.currentValue}</p>}

                    {/* Quantity + Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" name="quantity" type="text" inputMode="decimal" placeholder="Units held" value={formData.quantity} onChange={handleChange} error={errors.quantity} />
                        <Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} error={errors.purchaseDate} />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>Cancel</Button>
                        <Button type="submit" fullWidth loading={isSubmitting}>{editingItem ? 'Update' : 'Add'} Investment</Button>
                    </div>
                </form>
            </Modal>

            {/* ── Investment Limit Modal (Free Users) ────────────────────────── */}
            <Modal isOpen={limitModal} onClose={() => setLimitModal(false)} title="Investment Limit">
                <div className="space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You've reached the limit</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Free plan: <span className="font-semibold">3 investments</span><br />
                            Pro & Business: <span className="font-semibold">Unlimited</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Upgrade your plan to track more investments.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setLimitModal(false)}
                            fullWidth
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                setLimitModal(false);
                                navigate('/dashboard/pricing');
                            }}
                            fullWidth
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            View Plans
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Investments;