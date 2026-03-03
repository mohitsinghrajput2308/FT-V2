import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Plus, Edit2, Trash2, Briefcase,
  Search, Star, StarOff, Bell, BarChart2, Layers, Activity,
  Info, X, ArrowUpRight, ArrowDownRight, Target, Zap,
  Shield, Globe, Cpu, Landmark, Coins
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import EmptyState from '../components/Common/EmptyState';
import PortfolioChart from '../components/Charts/PortfolioChart';

// ─── Mock Data Engine ─────────────────────────────────────────────────────────
const seed = (n) => { let x = Math.sin(n) * 10000; return x - Math.floor(x); };

const generatePriceSeries = (base, days, volatility = 0.02, trend = 0.001) => {
  const data = [];
  let price = base;
  for (let i = days; i >= 0; i--) {
    const change = price * (trend + (seed(base * i + 7) - 0.5) * volatility * 2);
    price = Math.max(price + change, 1);
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.round(1000000 * (0.5 + seed(base * i) * 1.5)),
    });
  }
  return data;
};

const ASSET_UNIVERSE = [
  { id: 'AAPL',    name: 'Apple Inc.',           type: 'Stock',     sector: 'Technology', base: 189.5,  trend: 0.0008, vol: 0.018, pe: 29.2, pb: 46.1, roe: 160.1, mktCap: '2.94T', beta: 1.24, div: '0.51%', icon: Globe,    color: '#6366f1' },
  { id: 'RELIANCE',name: 'Reliance Industries',  type: 'Stock',     sector: 'Energy',     base: 2780,   trend: 0.0005, vol: 0.016, pe: 26.8, pb: 2.4,  roe: 10.8,  mktCap: '18.8T', beta: 0.91, div: '0.35%', icon: Landmark, color: '#f59e0b' },
  { id: 'BTC',     name: 'Bitcoin',               type: 'Crypto',    sector: 'Crypto',     base: 68400,  trend: 0.0012, vol: 0.042, pe: null, pb: null, roe: null,  mktCap: '1.35T', beta: 2.1,  div: '—',     icon: Coins,    color: '#f97316' },
  { id: 'ETH',     name: 'Ethereum',              type: 'Crypto',    sector: 'Crypto',     base: 3540,   trend: 0.0009, vol: 0.048, pe: null, pb: null, roe: null,  mktCap: '425B',  beta: 2.4,  div: '—',     icon: Coins,    color: '#8b5cf6' },
  { id: 'NIFTY50', name: 'Nifty 50 Index',       type: 'ETF',       sector: 'Index',      base: 22450,  trend: 0.0004, vol: 0.013, pe: 22.1, pb: 3.8,  roe: 15.2,  mktCap: 'Index', beta: 1.0,  div: '1.2%',  icon: BarChart2, color: '#10b981' },
  { id: 'GOLD',    name: 'Gold (MCX)',             type: 'Commodity', sector: 'Precious',   base: 72400,  trend: 0.0003, vol: 0.010, pe: null, pb: null, roe: null,  mktCap: '—',     beta: 0.1,  div: '—',     icon: Activity, color: '#eab308' },
  { id: 'MSFT',    name: 'Microsoft Corp.',       type: 'Stock',     sector: 'Technology', base: 415.2,  trend: 0.0007, vol: 0.015, pe: 35.4, pb: 14.2, roe: 43.5,  mktCap: '3.08T', beta: 0.91, div: '0.73%', icon: Cpu,      color: '#3b82f6' },
  { id: 'INFY',    name: 'Infosys Ltd.',          type: 'Stock',     sector: 'IT',         base: 1485,   trend: 0.0004, vol: 0.019, pe: 24.1, pb: 7.3,  roe: 29.3,  mktCap: '6.1T',  beta: 0.78, div: '2.1%',  icon: Globe,    color: '#06b6d4' },
  { id: 'SILVER',  name: 'Silver (MCX)',           type: 'Commodity', sector: 'Precious',   base: 85200,  trend: 0.0002, vol: 0.022, pe: null, pb: null, roe: null,  mktCap: '—',     beta: 0.3,  div: '—',     icon: Activity, color: '#94a3b8' },
  { id: 'SBIETF',  name: 'SBI ETF Nifty Bank',   type: 'ETF',       sector: 'Banking',    base: 545,    trend: 0.0005, vol: 0.017, pe: 14.2, pb: 1.8,  roe: 14.8,  mktCap: '—',     beta: 1.15, div: '0.9%',  icon: Landmark, color: '#ec4899' },
];

const TIMEFRAMES = ['1W', '1M', '3M', '6M', '1Y'];
const TF_DAYS = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };

const computeRSI = (prices, period = 14) => {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period, avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(1));
};

const computeSMA = (prices, period) => {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
};

const COLORS_PIE = ['#6366f1', '#f59e0b', '#10b981', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#eab308'];

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

// ─── Shared UI ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'portfolio', label: 'Portfolio',    icon: Briefcase },
  { id: 'market',    label: 'Market Watch', icon: Globe },
  { id: 'analysis',  label: 'Analysis',     icon: BarChart2 },
  { id: 'compare',   label: 'Compare',      icon: Layers },
  { id: 'watchlist', label: 'Watchlist',    icon: Star },
];

const TabBar = ({ active, setActive }) => (
  <div className="flex items-center gap-1 flex-wrap bg-gray-100 dark:bg-dark-300 rounded-xl p-1.5">
    {TABS.map(({ id, label, icon: Icon }) => (
      <button key={id} onClick={() => setActive(id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
          ${active === id
            ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    ))}
  </div>
);

const SimBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
    <Zap className="w-2.5 h-2.5" /> Simulated Data
  </span>
);

const Sparkline = ({ data, positive }) => (
  <ResponsiveContainer width="100%" height={36}>
    <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
      <Area type="monotone" dataKey="price"
        stroke={positive ? '#10b981' : '#ef4444'}
        fill={positive ? '#10b98120' : '#ef444420'}
        strokeWidth={1.5} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Portfolio Tab ────────────────────────────────────────────────────────────
const PortfolioTab = ({ currency, dateFormat }) => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', type: '', purchasePrice: '', currentValue: '', quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
    const totalInvested = investments.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
    const totalCurrentValue = investments.reduce((s, i) => s + i.currentValue * i.quantity, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const percentageChange = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrentValue, totalProfitLoss, percentageChange };
  }, [investments]);

  const portfolioData = useMemo(() => {
    const byType = investments.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + i.currentValue * i.quantity;
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
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) newErrors.purchasePrice = 'Valid purchase price is required';
    if (!formData.currentValue || parseFloat(formData.currentValue) <= 0) newErrors.currentValue = 'Valid current value is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      name: formData.name, type: formData.type,
      purchasePrice: parseFloat(formData.purchasePrice), currentValue: parseFloat(formData.currentValue),
      quantity: parseFloat(formData.quantity), purchaseDate: formData.purchaseDate
    };
    if (editingItem) updateInvestment(editingItem.id, data); else addInvestment(data);
    closeModal();
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, type: item.type, purchasePrice: item.purchasePrice.toString(), currentValue: item.currentValue.toString(), quantity: item.quantity.toString(), purchaseDate: item.purchaseDate });
    } else {
      setEditingItem(null);
      setFormData({ name: '', type: '', purchasePrice: '', currentValue: '', quantity: '', purchaseDate: new Date().toISOString().split('T')[0] });
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingItem(null); };
  const handleDelete = (id) => { if (window.confirm('Delete this investment?')) deleteInvestment(id); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => openModal()} icon={Plus}>Add Investment</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: formatCurrency(stats.totalInvested, currency), cls: 'text-gray-900 dark:text-white' },
          { label: 'Current Value',  value: formatCurrency(stats.totalCurrentValue, currency), cls: 'text-primary-600 dark:text-primary-400' },
          { label: 'Total P&L',      value: `${stats.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(stats.totalProfitLoss, currency)}`, cls: stats.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600' },
          { label: 'Returns',        value: `${stats.percentageChange >= 0 ? '+' : ''}${stats.percentageChange.toFixed(2)}%`, cls: stats.percentageChange >= 0 ? 'text-success-600' : 'text-danger-600' },
        ].map(({ label, value, cls }) => (
          <Card key={label} padding={false} className="px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${cls}`}>{value}</p>
          </Card>
        ))}
      </div>

      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Portfolio Distribution</h3>
            <PortfolioChart data={portfolioData} height={260} currency={currency} />
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Allocation by Value</h3>
            <div className="space-y-3">
              {portfolioData.map(({ name, value }, i) => {
                const pct = stats.totalCurrentValue > 0 ? (value / stats.totalCurrentValue) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-dark-400 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {investments.length === 0 ? (
        <EmptyState icon={Briefcase} title="No investments" description="Start tracking your portfolio." action={() => openModal()} actionLabel="Add Investment" />
      ) : (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-400">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {['Investment', 'Type', 'Qty', 'Avg Cost', 'Current', 'Invested', 'Value', 'P&L', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const invested = inv.purchasePrice * inv.quantity;
                  const current = inv.currentValue * inv.quantity;
                  const pl = current - invested;
                  const plPct = invested > 0 ? (pl / invested) * 100 : 0;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <p className="font-semibold text-gray-900 dark:text-white">{inv.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(inv.purchaseDate, dateFormat)}</p>
                      </td>
                      <td><span className="badge badge-primary">{inv.type}</span></td>
                      <td>{inv.quantity}</td>
                      <td>{formatCurrency(inv.purchasePrice, currency)}</td>
                      <td>{formatCurrency(inv.currentValue, currency)}</td>
                      <td>{formatCurrency(invested, currency)}</td>
                      <td className="font-semibold text-gray-900 dark:text-white">{formatCurrency(current, currency)}</td>
                      <td>
                        <p className={`font-semibold ${pl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{pl >= 0 ? '+' : ''}{formatCurrency(pl, currency)}</p>
                        <p className={`text-xs ${pl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openModal(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Investment' : 'Add Investment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Investment Name" name="name" placeholder="e.g., Reliance Industries" value={formData.name} onChange={handleChange} error={errors.name} />
          <Select label="Type" name="type" options={investmentTypes} value={formData.type} onChange={handleChange} error={errors.type} />
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

// ─── Market Watch Tab ─────────────────────────────────────────────────────────
const MarketWatchTab = ({ onAnalyze }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const types = ['All', 'Stock', 'Crypto', 'ETF', 'Commodity'];

  const priceData = useMemo(() =>
    ASSET_UNIVERSE.map(a => {
      const series = generatePriceSeries(a.base, 7, a.vol, a.trend);
      const latest = series[series.length - 1].price;
      const chg = ((latest - series[0].price) / series[0].price) * 100;
      return { ...a, price: latest, change: parseFloat(chg.toFixed(2)), sparkData: series };
    }), []);

  const filtered = priceData.filter(a =>
    (filter === 'All' || a.type === filter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <SimBadge />
        <div className="flex-1 relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(asset => {
          const Icon = asset.icon;
          return (
            <motion.div key={asset.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-400 p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onAnalyze(asset)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: asset.color + '22' }}>
                    <Icon className="w-4 h-4" style={{ color: asset.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{asset.id}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{asset.name}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${asset.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(asset.change)}%
                </span>
              </div>
              <div className="h-9 mb-2">
                <Sparkline data={asset.sparkData} positive={asset.change >= 0} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-gray-900 dark:text-white">{asset.price.toLocaleString()}</p>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Analysis Tab ─────────────────────────────────────────────────────────────
const AnalysisTab = ({ preSelected }) => {
  const [selected, setSelected] = useState(preSelected || null);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tf, setTf] = useState('3M');
  const [subTab, setSubTab] = useState('overview');
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(5);
  const dropRef = useRef(null);

  useEffect(() => { if (preSelected) { setSelected(preSelected); setSearch(''); setShowDropdown(false); } }, [preSelected]);
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const priceHistory = useMemo(() =>
    selected ? generatePriceSeries(selected.base, TF_DAYS[tf], selected.vol, selected.trend) : [],
    [selected, tf]);

  const prices = useMemo(() => priceHistory.map(d => d.price), [priceHistory]);
  const rsi = useMemo(() => computeRSI(prices), [prices]);
  const sma20 = useMemo(() => parseFloat(computeSMA(prices, 20).toFixed(2)), [prices]);
  const sma50 = useMemo(() => parseFloat(computeSMA(prices, 50).toFixed(2)), [prices]);

  const volatility = useMemo(() => {
    if (prices.length < 2) return 0;
    const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    return parseFloat((Math.sqrt(variance * 252) * 100).toFixed(1));
  }, [prices]);

  const sharpe = useMemo(() => {
    if (!selected || volatility === 0) return 0;
    return parseFloat(((selected.trend * 252 * 100 - 6) / volatility).toFixed(2));
  }, [selected, volatility]);

  const maxDrawdown = useMemo(() => {
    if (prices.length < 2) return 0;
    let peak = prices[0], maxDD = 0;
    for (const p of prices) {
      if (p > peak) peak = p;
      const dd = (p - peak) / peak * 100;
      if (dd < maxDD) maxDD = dd;
    }
    return parseFloat(maxDD.toFixed(2));
  }, [prices]);

  const chartWithSMA = useMemo(() => priceHistory.map((d, i) => ({
    ...d,
    sma20: i >= 19 ? parseFloat(computeSMA(prices.slice(0, i + 1), 20).toFixed(2)) : null,
  })), [priceHistory, prices]);

  const sipData = useMemo(() => {
    const growth = (selected?.trend || 0.001) * 252;
    let corpus = 0;
    const data = [];
    for (let m = 1; m <= sipYears * 12; m++) {
      corpus = (corpus + sipMonthly) * (1 + growth / 12);
      if (m % 6 === 0) data.push({ month: `Y${Math.ceil(m / 12)}`, value: Math.round(corpus), invested: sipMonthly * m });
    }
    return data;
  }, [sipMonthly, sipYears, selected]);

  const drawdownData = useMemo(() => {
    let peak = prices[0] || 1;
    return priceHistory.map(d => {
      if (d.price > peak) peak = d.price;
      return { ...d, drawdown: parseFloat(((d.price - peak) / peak * 100).toFixed(2)) };
    });
  }, [priceHistory, prices]);

  const filtered = ASSET_UNIVERSE.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  const ANALYSIS_TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'technicals',   label: 'Technicals' },
    { id: 'fundamentals', label: 'Fundamentals' },
    { id: 'risk',         label: 'Risk' },
    { id: 'roi',          label: 'ROI Calculator' },
  ];

  if (!selected) return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="text-center">
        <BarChart2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Select an asset to analyze</p>
        <p className="text-sm text-gray-400 mt-1">Get fundamentals, technicals, risk metrics, and ROI projections</p>
      </div>
      <div ref={dropRef} className="w-full max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search (AAPL, BTC, GOLD…)" value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)} />
        </div>
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1.5 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-400 rounded-xl shadow-lg overflow-hidden">
            {filtered.map(a => (
              <button key={a.id} onClick={() => { setSelected(a); setSearch(''); setShowDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.id}</p>
                  <p className="text-xs text-gray-400">{a.name}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-400 px-2 py-0.5 rounded-full">{a.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const Icon = selected.icon;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selected.color + '22' }}>
            <Icon className="w-5 h-5" style={{ color: selected.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.id}</h2>
              <span className="text-xs bg-gray-100 dark:bg-dark-300 text-gray-500 px-2 py-0.5 rounded-full">{selected.type}</span>
              <SimBadge />
            </div>
            <p className="text-sm text-gray-500">{selected.name} — {selected.sector}</p>
          </div>
        </div>
        <button onClick={() => { setSelected(null); setSubTab('overview'); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <X className="w-4 h-4" /> Change
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Price',    value: prices.length ? prices[prices.length - 1].toLocaleString() : '—' },
          { label: 'Mkt Cap',  value: selected.mktCap },
          { label: 'Beta',     value: selected.beta },
          { label: 'Dividend', value: selected.div },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-400 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 flex-wrap border-b border-gray-100 dark:border-dark-400 pb-1">
        {ANALYSIS_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors ${subTab === t.id ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >{t.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex flex-col gap-5">

          {subTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Price Chart</h3>
                  <div className="flex gap-1">
                    {TIMEFRAMES.map(t => (
                      <button key={t} onClick={() => setTf(t)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${tf === t ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={priceHistory} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selected.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selected.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={Math.floor(priceHistory.length / 5)} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} tickLine={false} width={58} tickFormatter={v => v.toLocaleString()} />
                    <Tooltip formatter={v => [v.toLocaleString(), 'Price']} contentStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="price" stroke={selected.color} fill="url(#priceGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                {[
                  { label: 'RSI (14)', value: rsi, note: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral', noteCls: rsi > 70 ? 'text-danger-500' : rsi < 30 ? 'text-success-500' : 'text-gray-400' },
                  { label: 'SMA 20', value: sma20.toLocaleString(), note: '', noteCls: '' },
                  { label: 'SMA 50', value: sma50.toLocaleString(), note: '', noteCls: '' },
                  { label: 'Volatility', value: `${volatility}%`, note: volatility > 30 ? 'High' : volatility > 15 ? 'Medium' : 'Low', noteCls: volatility > 30 ? 'text-danger-500' : 'text-success-500' },
                  { label: 'Sharpe Ratio', value: sharpe, note: sharpe > 1 ? 'Good' : sharpe > 0 ? 'OK' : 'Poor', noteCls: sharpe > 1 ? 'text-success-500' : sharpe > 0 ? 'text-warning-500' : 'text-danger-500' },
                  { label: 'Max Drawdown', value: `${maxDrawdown}%`, note: '', noteCls: 'text-danger-500' },
                ].map(({ label, value, note, noteCls }) => (
                  <div key={label} className="flex items-center justify-between border-b border-gray-50 dark:border-dark-400/50 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                    <p className="text-xs text-gray-500">{label}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                      {note && <p className={`text-xs ${noteCls}`}>{note}</p>}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {subTab === 'technicals' && (
            <div className="flex flex-col gap-5">
              <Card>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Price + SMA 20</h3>
                  <div className="flex gap-1">
                    {TIMEFRAMES.map(t => (
                      <button key={t} onClick={() => setTf(t)}
                        className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${tf === t ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartWithSMA} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={Math.floor(chartWithSMA.length / 5)} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} tickLine={false} width={58} tickFormatter={v => v.toLocaleString()} />
                    <Tooltip formatter={(v, n) => [v?.toLocaleString(), n === 'price' ? 'Price' : 'SMA 20']} contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="price" stroke={selected.color} strokeWidth={2} dot={false} name="Price" />
                    <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls name="SMA 20" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Volume</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={priceHistory.slice(-30)} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} tickFormatter={v => (v / 1e6).toFixed(1) + 'M'} />
                      <Tooltip formatter={v => [(v / 1e6).toFixed(2) + 'M', 'Volume']} contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="volume" fill={selected.color + 'aa'} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                <Card>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">RSI (14) — {rsi}</h3>
                  <div className="mb-3">
                    <div className="h-3 rounded-full bg-gradient-to-r from-success-500 via-warning-400 to-danger-500 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md bg-gray-800 transition-all" style={{ left: `calc(${Math.min(rsi, 98)}% - 8px)` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 Oversold</span><span>50</span><span>Overbought 100</span>
                    </div>
                  </div>
                  <div className={`text-center py-2 rounded-lg text-sm font-bold ${rsi < 30 ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400' : rsi > 70 ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400' : 'bg-gray-50 text-gray-700 dark:bg-dark-300 dark:text-gray-300'}`}>
                    {rsi < 30 ? 'Oversold — Potential Buy Zone' : rsi > 70 ? 'Overbought — Exercise Caution' : 'Neutral Range'}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="text-center"><p className="text-xs text-gray-400">SMA 20</p><p className="font-bold text-sm text-gray-900 dark:text-white">{sma20.toLocaleString()}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-400">SMA 50</p><p className="font-bold text-sm text-gray-900 dark:text-white">{sma50.toLocaleString()}</p></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {subTab === 'fundamentals' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Valuation Metrics</h3>
                {selected.pe ? (
                  <div className="space-y-5">
                    {[
                      { label: 'P/E Ratio', value: selected.pe, benchmark: 25, good: selected.pe < 25 },
                      { label: 'P/B Ratio', value: selected.pb, benchmark: 5, good: selected.pb < 5 },
                      { label: 'ROE (%)',   value: selected.roe, benchmark: 15, good: selected.roe > 15 },
                    ].map(({ label, value, benchmark, good }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 dark:text-gray-400">{label}</span>
                          <span className={`font-bold ${good ? 'text-success-600' : 'text-warning-600'}`}>{value} {good ? '✓' : '△'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-400">
                          <div className="h-full rounded-full" style={{ width: `${Math.min((value / (benchmark * 2)) * 100, 100)}%`, backgroundColor: good ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Sector benchmark: {benchmark}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                    <Info className="w-8 h-8" />
                    <p className="text-sm">Fundamental data not available for {selected.type}</p>
                  </div>
                )}
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={[
                    { subject: 'Momentum', A: Math.min(rsi, 100) },
                    { subject: 'Safety',   A: Math.max(0, 100 - selected.beta * 35) },
                    { subject: 'Quality',  A: selected.roe ? Math.min(selected.roe, 100) : 40 },
                    { subject: 'Value',    A: selected.pe ? Math.max(0, 100 - selected.pe * 2) : 50 },
                    { subject: 'Sharpe',   A: Math.min(Math.max(sharpe * 40, 0), 100) },
                  ]} cx="50%" cy="50%" outerRadius={80}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar dataKey="A" stroke={selected.color} fill={selected.color} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {subTab === 'risk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-500" /> Risk Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Annual Volatility',  value: `${volatility}%`,            desc: 'Annualized std dev of returns', cls: volatility > 30 ? 'text-danger-600' : volatility > 15 ? 'text-warning-600' : 'text-success-600' },
                    { label: 'Beta vs Market',     value: selected.beta,               desc: '1.0 = moves with market',       cls: selected.beta > 1.5 ? 'text-danger-600' : selected.beta > 0.8 ? 'text-warning-600' : 'text-success-600' },
                    { label: 'Sharpe Ratio',       value: sharpe,                      desc: 'Risk-adjusted return (>1 good)', cls: sharpe > 1 ? 'text-success-600' : sharpe > 0 ? 'text-warning-600' : 'text-danger-600' },
                    { label: 'Max Drawdown',       value: `${maxDrawdown}%`,           desc: `Worst peak-to-trough (${tf})`,  cls: 'text-danger-600' },
                    { label: 'VaR 95% (1-day)',   value: `${(volatility * 1.645 / Math.sqrt(252)).toFixed(2)}%`, desc: 'Max expected daily loss (95% CI)', cls: 'text-warning-600' },
                  ].map(({ label, value, desc, cls }) => (
                    <div key={label} className="flex items-center justify-between border-b border-gray-50 dark:border-dark-400/50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <p className={`text-base font-bold ${cls}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Drawdown Chart</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={drawdownData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={Math.floor(priceHistory.length / 5)} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={v => [`${v}%`, 'Drawdown']} contentStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {subTab === 'roi' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" /> SIP Simulator
                </h3>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Monthly Investment</label>
                    <input type="range" min={500} max={50000} step={500} value={sipMonthly} onChange={e => setSipMonthly(+e.target.value)} className="w-full accent-primary-500" />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>₹500</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">₹{sipMonthly.toLocaleString()}</span>
                      <span>₹50K</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Duration: {sipYears} years</label>
                    <input type="range" min={1} max={30} value={sipYears} onChange={e => setSipYears(+e.target.value)} className="w-full accent-primary-500" />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>1yr</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{sipYears}yr</span>
                      <span>30yr</span>
                    </div>
                  </div>
                </div>
                {sipData.length > 0 && (() => {
                  const last = sipData[sipData.length - 1];
                  const gain = last.value - last.invested;
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Invested', value: `₹${(last.invested / 1e5).toFixed(1)}L`, cls: 'text-gray-900 dark:text-white' },
                        { label: 'Est. Value', value: `₹${(last.value / 1e5).toFixed(1)}L`, cls: 'text-primary-600 dark:text-primary-400' },
                        { label: 'Total Gain', value: `₹${(gain / 1e5).toFixed(1)}L`, cls: gain >= 0 ? 'text-success-600' : 'text-danger-600' },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="text-center bg-gray-50 dark:bg-dark-300 rounded-xl py-3">
                          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                          <p className={`text-sm font-bold ${cls}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Corpus Growth</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={sipData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n === 'value' ? 'Corpus' : 'Invested']} contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#sipGrad)" strokeWidth={2} dot={false} name="value" />
                    <Area type="monotone" dataKey="invested" stroke="#10b981" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="invested" />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Compare Tab ──────────────────────────────────────────────────────────────
const CompareTab = () => {
  const [selected, setSelected] = useState([ASSET_UNIVERSE[0], ASSET_UNIVERSE[2]]);
  const [search, setSearch] = useState('');
  const [tf, setTf] = useState('3M');

  const filteredDropdown = ASSET_UNIVERSE.filter(a =>
    !selected.find(s => s.id === a.id) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const chartData = useMemo(() => {
    const days = TF_DAYS[tf];
    if (!selected.length) return [];
    const seriesList = selected.map(a => {
      const data = generatePriceSeries(a.base, days, a.vol, a.trend);
      const base0 = data[0].price;
      return { id: a.id, indexed: data.map(d => ({ date: d.date, [a.id]: parseFloat(((d.price / base0) * 100).toFixed(2)) })) };
    });
    return seriesList[0].indexed.map((d, i) => {
      const row = { date: d.date };
      seriesList.forEach(s => { row[s.id] = s.indexed[i]?.[s.id] ?? null; });
      return row;
    });
  }, [selected, tf]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <SimBadge />
        {selected.map(a => (
          <span key={a.id} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: a.color }}>
            {a.id}
            <button onClick={() => setSelected(prev => prev.filter(x => x.id !== a.id))} className="opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {selected.length < 4 && (
          <div className="relative">
            <input className="pl-3 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+ Add asset" value={search} onChange={e => setSearch(e.target.value)} />
            {search && filteredDropdown.length > 0 && (
              <div className="absolute z-10 left-0 top-full mt-1 w-48 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-400 rounded-xl shadow-lg overflow-hidden">
                {filteredDropdown.slice(0, 5).map(a => (
                  <button key={a.id} onClick={() => { setSelected(prev => [...prev, a]); setSearch(''); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-dark-300 flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{a.id}</span>
                    <span className="text-gray-400">{a.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="ml-auto flex gap-1">
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTf(t)} className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${tf === t ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300'}`}>{t}</button>
          ))}
        </div>
      </div>

      {chartData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Normalized Performance (Base = 100)</h3>
          <p className="text-xs text-gray-400 mb-4">All assets indexed to 100 at period start</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} interval={Math.floor(chartData.length / 5)} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} tickLine={false} />
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selected.map(a => <Line key={a.id} type="monotone" dataKey={a.id} stroke={a.color} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {selected.length > 0 && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-400">
            <h3 className="font-semibold text-gray-900 dark:text-white">Side-by-Side Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-400">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Metric</th>
                  {selected.map(a => <th key={a.id} className="text-center px-4 py-3 text-xs font-bold" style={{ color: a.color }}>{a.id}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Type',     get: a => a.type },
                  { label: 'Sector',   get: a => a.sector },
                  { label: 'Mkt Cap',  get: a => a.mktCap },
                  { label: 'Beta',     get: a => a.beta },
                  { label: 'Dividend', get: a => a.div },
                  { label: 'P/E',      get: a => a.pe ?? '—' },
                  { label: 'ROE (%)',  get: a => a.roe ?? '—' },
                ].map(({ label, get }) => (
                  <tr key={label} className="border-b border-gray-50 dark:border-dark-400/40 hover:bg-gray-50 dark:hover:bg-dark-300/20">
                    <td className="px-4 py-2.5 text-xs text-gray-500 font-medium">{label}</td>
                    {selected.map(a => <td key={a.id} className="px-4 py-2.5 text-center text-xs font-semibold text-gray-800 dark:text-gray-200">{get(a)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Watchlist Tab ────────────────────────────────────────────────────────────
const WatchlistTab = ({ onAnalyze }) => {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_watchlist') || '["AAPL","BTC","GOLD"]'); } catch { return ['AAPL', 'BTC', 'GOLD']; }
  });
  const [alerts, setAlerts] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => { localStorage.setItem('ft_watchlist', JSON.stringify(watchlist)); }, [watchlist]);

  const watchedAssets = useMemo(() => ASSET_UNIVERSE.filter(a => watchlist.includes(a.id)).map(a => {
    const series = generatePriceSeries(a.base, 7, a.vol, a.trend);
    const latest = series[series.length - 1].price;
    const chg = ((latest - series[0].price) / series[0].price) * 100;
    return { ...a, price: latest, change: parseFloat(chg.toFixed(2)), sparkData: series };
  }), [watchlist]);

  const filteredDropdown = ASSET_UNIVERSE.filter(a =>
    !watchlist.includes(a.id) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <SimBadge />
        <div className="relative">
          <input className="pl-3 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add to watchlist..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && filteredDropdown.length > 0 && (
            <div className="absolute z-10 left-0 top-full mt-1 w-52 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-400 rounded-xl shadow-lg overflow-hidden">
              {filteredDropdown.slice(0, 6).map(a => (
                <button key={a.id} onClick={() => { setWatchlist(prev => [...prev, a.id]); setSearch(''); }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-dark-300 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-bold text-gray-900 dark:text-white">{a.id}</span>
                  <span className="text-xs text-gray-400 truncate">{a.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {watchedAssets.length === 0 ? (
        <EmptyState icon={Star} title="Watchlist is empty" description="Search and add assets to track them here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {watchedAssets.map(asset => {
            const Icon = asset.icon;
            const alert = alerts[asset.id];
            return (
              <Card key={asset.id}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: asset.color + '22' }}>
                      <Icon className="w-4 h-4" style={{ color: asset.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{asset.id}</p>
                      <p className="text-xs text-gray-400">{asset.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onAnalyze(asset)} title="Analyze" className="p-1 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setWatchlist(prev => prev.filter(x => x !== asset.id))} title="Remove" className="p-1 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors">
                      <StarOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-9 mb-2">
                  <Sparkline data={asset.sparkData} positive={asset.change >= 0} />
                </div>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{asset.price.toLocaleString()}</span>
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${asset.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(asset.change)}% (7d)
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-dark-400 pt-3 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input type="number"
                    className="flex-1 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder={`Alert at price…`}
                    value={alert || ''}
                    onChange={e => setAlerts(prev => ({ ...prev, [asset.id]: e.target.value }))} />
                  {alert && +alert > 0 && (
                    <span className={`text-xs font-semibold whitespace-nowrap ${+alert > asset.price ? 'text-success-600' : 'text-danger-600'}`}>
                      {+alert > asset.price ? '▲ Above' : '▼ Below'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const Investments = () => {
  const { currency, dateFormat } = useFinance();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [analyzeAsset, setAnalyzeAsset] = useState(null);

  const handleAnalyze = useCallback((asset) => {
    setAnalyzeAsset(asset);
    setActiveTab('analysis');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Portfolio · Market Watch · Analysis · Compare · Watchlist</p>
      </div>

      <TabBar active={activeTab} setActive={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'portfolio' && <PortfolioTab currency={currency} dateFormat={dateFormat} />}
          {activeTab === 'market'    && <MarketWatchTab onAnalyze={handleAnalyze} />}
          {activeTab === 'analysis'  && <AnalysisTab preSelected={analyzeAsset} />}
          {activeTab === 'compare'   && <CompareTab />}
          {activeTab === 'watchlist' && <WatchlistTab onAnalyze={handleAnalyze} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Investments;