import { useState, useMemo } from 'react';
import {
    Calculator, TrendingUp, Coins, PiggyBank, Wallet,
    ReceiptText, RefreshCw, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    calculateEMI, calculateSIP, calculateCompoundInterest,
    calculateFD, calculateRetirement, calculateSavingsGoal, calculateIncomeTax
} from '../utils/calculators';
import { formatCurrency } from '../utils/helpers';
import { useFinance } from '../context/FinanceContext';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';

const TABS = [
    { id: 'emi',        label: 'EMI',           icon: Calculator,   color: 'primary' },
    { id: 'sip',        label: 'SIP',           icon: TrendingUp,   color: 'success' },
    { id: 'fd',         label: 'Fixed Deposit', icon: PiggyBank,    color: 'warning' },
    { id: 'ci',         label: 'Compound Int.', icon: Coins,        color: 'purple'  },
    { id: 'retirement', label: 'Retirement',    icon: Wallet,       color: 'rose'    },
    { id: 'goal',       label: 'Savings Goal',  icon: ChevronRight, color: 'teal'    },
    { id: 'tax',        label: 'Tax Estimator', icon: ReceiptText,  color: 'danger'  },
];

const GRAD = {
    primary:  'from-primary-500 to-primary-700',
    success:  'from-success-500 to-success-700',
    warning:  'from-yellow-400 to-yellow-600',
    purple:   'from-purple-500 to-purple-700',
    rose:     'from-rose-500 to-rose-700',
    teal:     'from-teal-500 to-teal-700',
    danger:   'from-red-500 to-red-700',
};

const F = (v, c) => formatCurrency(v, c);
const Stat = ({ label, value, sub }) => (
    <div className="p-4 bg-white/10 rounded-xl">
        <p className="text-white/70 text-xs mb-1">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </div>
);

const CHART_STYLE = { fontSize: 11 };
const TOOLTIP_STYLE = { fontSize: 12, borderRadius: 8 };

const Calculators = () => {
    const { currency } = useFinance();
    const [activeTab, setActiveTab] = useState('emi');

    // ── EMI ──────────────────────────────────────────────────────────────────
    const [emi, setEmi] = useState({ principal: '', rate: '', tenure: '' });
    const [emiRes, setEmiRes] = useState(null);

    const calcEMI = () => {
        const { principal, rate, tenure } = emi;
        if (!principal || !rate || !tenure) return;
        const r = calculateEMI(+principal, +rate, +tenure);
        // Build month-by-month amortisation (first 24 or all)
        const mr = (+rate) / 12 / 100;
        const n = +tenure;
        const schedule = [];
        let bal = +principal;
        for (let i = 1; i <= Math.min(n, 24); i++) {
            const interest = bal * mr;
            const principal_p = r.emi - interest;
            bal = Math.max(0, bal - principal_p);
            schedule.push({ month: `M${i}`, principal: Math.round(principal_p), interest: Math.round(interest), balance: Math.round(bal) });
        }
        setEmiRes({ ...r, schedule });
    };

    // ── SIP ──────────────────────────────────────────────────────────────────
    const [sip, setSip] = useState({ monthly: '', rate: '', years: '' });
    const [sipRes, setSipRes] = useState(null);

    const calcSIP = () => {
        const { monthly, rate, years } = sip;
        if (!monthly || !rate || !years) return;
        const r = calculateSIP(+monthly, +rate, +years);
        const yearlyGrowth = [];
        const mr = (+rate) / 12 / 100;
        for (let y = 1; y <= +years; y++) {
            const m = y * 12;
            const fv = mr > 0 ? +monthly * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr) : +monthly * m;
            yearlyGrowth.push({ year: `Yr ${y}`, invested: Math.round(+monthly * m), value: Math.round(fv) });
        }
        setSipRes({ ...r, yearlyGrowth });
    };

    // ── FD ───────────────────────────────────────────────────────────────────
    const [fd, setFd] = useState({ principal: '', rate: '', years: '', freq: '4' });
    const [fdRes, setFdRes] = useState(null);

    const calcFD = () => {
        const { principal, rate, years, freq } = fd;
        if (!principal || !rate || !years) return;
        setFdRes(calculateFD(+principal, +rate, +years, +freq));
    };

    // ── CI ───────────────────────────────────────────────────────────────────
    const [ci, setCi] = useState({ principal: '', rate: '', time: '', frequency: '12' });
    const [ciRes, setCiRes] = useState(null);

    const calcCI = () => {
        const { principal, rate, time, frequency } = ci;
        if (!principal || !rate || !time) return;
        const r = calculateCompoundInterest(+principal, +rate, +time, +frequency);
        const yearlyBreakdown = [];
        for (let y = 1; y <= Math.min(+time, 20); y++) {
            const a = +principal * Math.pow(1 + (+rate / 100) / +frequency, +frequency * y);
            yearlyBreakdown.push({ year: `Yr ${y}`, amount: Math.round(a), interest: Math.round(a - +principal) });
        }
        setCiRes({ ...r, yearlyBreakdown });
    };

    // ── Retirement ───────────────────────────────────────────────────────────
    const [ret, setRet] = useState({ currentAge: '', retireAge: '60', monthlyExpense: '', currentSavings: '0', monthlySaving: '', returnRate: '12' });
    const [retRes, setRetRes] = useState(null);

    const calcRet = () => {
        const { currentAge, retireAge, monthlyExpense, currentSavings, monthlySaving, returnRate } = ret;
        if (!currentAge || !monthlyExpense || !monthlySaving) return;
        setRetRes(calculateRetirement(+currentAge, +retireAge, +monthlyExpense, +currentSavings, +monthlySaving, +returnRate));
    };

    // ── Savings Goal ─────────────────────────────────────────────────────────
    const [goal, setGoal] = useState({ target: '', currentSavings: '0', years: '', returnRate: '8' });
    const [goalRes, setGoalRes] = useState(null);

    const calcGoal = () => {
        const { target, currentSavings, years, returnRate } = goal;
        if (!target || !years) return;
        setGoalRes(calculateSavingsGoal(+target, +currentSavings, +years, +returnRate));
    };

    // ── Tax ──────────────────────────────────────────────────────────────────
    const [tax, setTax] = useState({ income: '', regime: 'new' });
    const [taxRes, setTaxRes] = useState(null);

    const calcTax = () => {
        if (!tax.income) return;
        setTaxRes(calculateIncomeTax(+tax.income, tax.regime));
    };

    // ── Reset ────────────────────────────────────────────────────────────────
    const handleReset = () => {
        if (activeTab === 'emi') { setEmi({ principal: '', rate: '', tenure: '' }); setEmiRes(null); }
        if (activeTab === 'sip') { setSip({ monthly: '', rate: '', years: '' }); setSipRes(null); }
        if (activeTab === 'fd')  { setFd({ principal: '', rate: '', years: '', freq: '4' }); setFdRes(null); }
        if (activeTab === 'ci')  { setCi({ principal: '', rate: '', time: '', frequency: '12' }); setCiRes(null); }
        if (activeTab === 'retirement') { setRet({ currentAge: '', retireAge: '60', monthlyExpense: '', currentSavings: '0', monthlySaving: '', returnRate: '12' }); setRetRes(null); }
        if (activeTab === 'goal') { setGoal({ target: '', currentSavings: '0', years: '', returnRate: '8' }); setGoalRes(null); }
        if (activeTab === 'tax')  { setTax({ income: '', regime: 'new' }); setTaxRes(null); }
    };

    const activeColor = TABS.find(t => t.id === activeTab)?.color || 'primary';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Calculators</h1>
                    <p className="text-gray-500 dark:text-gray-400">7 calculators to plan every aspect of your finances</p>
                </div>
                <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Reset
                </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                                : 'bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-400'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── EMI Calculator ─────────────────────────────────────────────── */}
            {activeTab === 'emi' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">EMI Calculator</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Equated Monthly Installment for any loan</p>
                        <div className="space-y-4">
                            <Input label="Loan Amount" type="number" placeholder="e.g. 500000" value={emi.principal} onChange={e => setEmi({ ...emi, principal: e.target.value })} />
                            <Input label="Annual Interest Rate (%)" type="number" step="0.1" placeholder="e.g. 8.5" value={emi.rate} onChange={e => setEmi({ ...emi, rate: e.target.value })} />
                            <Input label="Tenure (months)" type="number" placeholder="e.g. 60" value={emi.tenure} onChange={e => setEmi({ ...emi, tenure: e.target.value })} />
                            <Button onClick={calcEMI} fullWidth icon={Calculator}>Calculate EMI</Button>
                        </div>
                    </Card>
                    {emiRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.primary} text-white`}>
                                <h4 className="font-semibold mb-4">Results</h4>
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                    <Stat label="Monthly EMI" value={F(emiRes.emi, currency)} />
                                    <Stat label="Total Payment" value={F(emiRes.totalPayment, currency)} />
                                    <Stat label="Total Interest" value={F(emiRes.totalInterest, currency)} sub={`${((emiRes.totalInterest / emiRes.totalPayment) * 100).toFixed(1)}% of total`} />
                                </div>
                            </div>
                            {/* Pie: Principal vs Interest */}
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Principal vs Interest</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={[{ name: 'Principal', value: +emi.principal }, { name: 'Interest', value: emiRes.totalInterest }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                            <Cell fill="#6366f1" />
                                            <Cell fill="#f97316" />
                                        </Pie>
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                            {/* Amortisation bar */}
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Monthly Breakdown (first 24 months)</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={emiRes.schedule} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={CHART_STYLE} tickLine={false} interval={3} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={55} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Bar dataKey="principal" stackId="a" fill="#6366f1" name="Principal" />
                                        <Bar dataKey="interest" stackId="a" fill="#f97316" name="Interest" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── SIP Calculator ─────────────────────────────────────────────── */}
            {activeTab === 'sip' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">SIP Calculator</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Systematic Investment Plan wealth builder</p>
                        <div className="space-y-4">
                            <Input label="Monthly Investment" type="number" placeholder="e.g. 5000" value={sip.monthly} onChange={e => setSip({ ...sip, monthly: e.target.value })} />
                            <Input label="Expected Annual Return (%)" type="number" step="0.1" placeholder="e.g. 12" value={sip.rate} onChange={e => setSip({ ...sip, rate: e.target.value })} />
                            <Input label="Investment Period (years)" type="number" placeholder="e.g. 10" value={sip.years} onChange={e => setSip({ ...sip, years: e.target.value })} />
                            <Button onClick={calcSIP} fullWidth icon={TrendingUp}>Calculate Returns</Button>
                        </div>
                    </Card>
                    {sipRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.success} text-white`}>
                                <h4 className="font-semibold mb-4">Results</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <Stat label="Future Value" value={F(sipRes.futureValue, currency)} />
                                    <Stat label="Total Invested" value={F(sipRes.invested, currency)} />
                                    <Stat label="Wealth Gained" value={F(sipRes.returns, currency)} sub={`${((sipRes.returns / sipRes.invested) * 100).toFixed(1)}% growth`} />
                                </div>
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Invested vs Portfolio Value</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={sipRes.yearlyGrowth} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={CHART_STYLE} tickLine={false} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={60} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Bar dataKey="invested" fill="#86efac" name="Invested" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="value" fill="#10b981" name="Portfolio Value" radius={[4, 4, 0, 0]} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── Fixed Deposit ──────────────────────────────────────────────── */}
            {activeTab === 'fd' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Fixed Deposit Calculator</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Maturity amount with compounding</p>
                        <div className="space-y-4">
                            <Input label="Principal Amount" type="number" placeholder="e.g. 100000" value={fd.principal} onChange={e => setFd({ ...fd, principal: e.target.value })} />
                            <Input label="Annual Interest Rate (%)" type="number" step="0.1" placeholder="e.g. 7.5" value={fd.rate} onChange={e => setFd({ ...fd, rate: e.target.value })} />
                            <Input label="Tenure (years)" type="number" placeholder="e.g. 5" value={fd.years} onChange={e => setFd({ ...fd, years: e.target.value })} />
                            <Select label="Compounding Frequency" value={fd.freq} onChange={e => setFd({ ...fd, freq: e.target.value })} options={[{ value: '1', label: 'Yearly' }, { value: '2', label: 'Half-Yearly' }, { value: '4', label: 'Quarterly' }, { value: '12', label: 'Monthly' }]} />
                            <Button onClick={calcFD} fullWidth icon={PiggyBank}>Calculate Maturity</Button>
                        </div>
                    </Card>
                    {fdRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.warning} text-white`}>
                                <h4 className="font-semibold mb-4">Results</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <Stat label="Maturity Amount" value={F(fdRes.maturity, currency)} />
                                    <Stat label="Principal" value={F(+fd.principal, currency)} />
                                    <Stat label="Interest Earned" value={F(fdRes.interest, currency)} sub={`${((fdRes.interest / +fd.principal) * 100).toFixed(1)}% gain`} />
                                </div>
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Year-by-Year Growth</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={fdRes.yearlyBreakdown} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={CHART_STYLE} tickLine={false} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={60} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Maturity" />
                                        <Line type="monotone" dataKey="interest" stroke="#f97316" strokeWidth={2} dot={false} name="Interest" strokeDasharray="4 2" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── Compound Interest ──────────────────────────────────────────── */}
            {activeTab === 'ci' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Compound Interest</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Watch your money grow exponentially</p>
                        <div className="space-y-4">
                            <Input label="Principal Amount" type="number" placeholder="e.g. 50000" value={ci.principal} onChange={e => setCi({ ...ci, principal: e.target.value })} />
                            <Input label="Annual Interest Rate (%)" type="number" step="0.1" placeholder="e.g. 10" value={ci.rate} onChange={e => setCi({ ...ci, rate: e.target.value })} />
                            <Input label="Time Period (years)" type="number" placeholder="e.g. 10" value={ci.time} onChange={e => setCi({ ...ci, time: e.target.value })} />
                            <Select label="Compounding Frequency" value={ci.frequency} onChange={e => setCi({ ...ci, frequency: e.target.value })} options={[{ value: '1', label: 'Yearly' }, { value: '2', label: 'Half-Yearly' }, { value: '4', label: 'Quarterly' }, { value: '12', label: 'Monthly' }]} />
                            <Button onClick={calcCI} fullWidth icon={Coins}>Calculate</Button>
                        </div>
                    </Card>
                    {ciRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.purple} text-white`}>
                                <h4 className="font-semibold mb-4">Results</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <Stat label="Maturity Amount" value={F(ciRes.amount, currency)} />
                                    <Stat label="Principal" value={F(+ci.principal, currency)} />
                                    <Stat label="Interest Earned" value={F(ciRes.interest, currency)} sub={`${((ciRes.interest / ciRes.amount) * 100).toFixed(1)}% of total`} />
                                </div>
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Growth Over Time</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={ciRes.yearlyBreakdown} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={CHART_STYLE} tickLine={false} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={60} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Line type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Total Amount" />
                                        <Line type="monotone" dataKey="interest" stroke="#ec4899" strokeWidth={2} dot={false} name="Interest" strokeDasharray="4 2" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── Retirement Calculator ──────────────────────────────────────── */}
            {activeTab === 'retirement' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Retirement Planner</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Plan corpus for retirement using 4% withdrawal rule + 6% inflation</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Current Age" type="number" placeholder="e.g. 30" value={ret.currentAge} onChange={e => setRet({ ...ret, currentAge: e.target.value })} />
                                <Input label="Retirement Age" type="number" placeholder="e.g. 60" value={ret.retireAge} onChange={e => setRet({ ...ret, retireAge: e.target.value })} />
                            </div>
                            <Input label="Current Monthly Expenses" type="number" placeholder="e.g. 40000" value={ret.monthlyExpense} onChange={e => setRet({ ...ret, monthlyExpense: e.target.value })} />
                            <Input label="Current Savings / Investments" type="number" placeholder="e.g. 200000" value={ret.currentSavings} onChange={e => setRet({ ...ret, currentSavings: e.target.value })} />
                            <Input label="Monthly Contribution (SIP)" type="number" placeholder="e.g. 10000" value={ret.monthlySaving} onChange={e => setRet({ ...ret, monthlySaving: e.target.value })} />
                            <Input label="Expected Return Rate (%)" type="number" step="0.5" placeholder="e.g. 12" value={ret.returnRate} onChange={e => setRet({ ...ret, returnRate: e.target.value })} />
                            <Button onClick={calcRet} fullWidth icon={Wallet}>Calculate Corpus</Button>
                        </div>
                    </Card>
                    {retRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.rose} text-white`}>
                                <h4 className="font-semibold mb-4">Retirement Analysis</h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Stat label="Projected Corpus" value={F(retRes.corpus, currency)} />
                                    <Stat label="Required Corpus" value={F(retRes.required, currency)} />
                                </div>
                                {retRes.shortfall > 0
                                    ? <div className="p-3 bg-white/20 rounded-xl text-sm">⚠️ Shortfall of <strong>{F(retRes.shortfall, currency)}</strong> — increase monthly SIP</div>
                                    : <div className="p-3 bg-white/20 rounded-xl text-sm">🎉 You are on track! Surplus of <strong>{F(retRes.corpus - retRes.required, currency)}</strong></div>
                                }
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Corpus Growth by Age</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={retRes.yearlyGrowth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={CHART_STYLE} tickLine={false} interval={Math.floor(retRes.yearlyGrowth.length / 5)} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={65} tickFormatter={v => `${(v/100000).toFixed(0)}L`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Line type="monotone" dataKey="corpus" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Corpus" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── Savings Goal ───────────────────────────────────────────────── */}
            {activeTab === 'goal' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Savings Goal Planner</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">How much to save monthly to reach your goal</p>
                        <div className="space-y-4">
                            <Input label="Target Amount" type="number" placeholder="e.g. 1000000" value={goal.target} onChange={e => setGoal({ ...goal, target: e.target.value })} />
                            <Input label="Already Saved" type="number" placeholder="e.g. 50000" value={goal.currentSavings} onChange={e => setGoal({ ...goal, currentSavings: e.target.value })} />
                            <Input label="Time to Goal (years)" type="number" placeholder="e.g. 5" value={goal.years} onChange={e => setGoal({ ...goal, years: e.target.value })} />
                            <Input label="Expected Return Rate (%)" type="number" step="0.5" placeholder="e.g. 8" value={goal.returnRate} onChange={e => setGoal({ ...goal, returnRate: e.target.value })} />
                            <Button onClick={calcGoal} fullWidth icon={ChevronRight}>Calculate</Button>
                        </div>
                    </Card>
                    {goalRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.teal} text-white`}>
                                <h4 className="font-semibold mb-4">Goal Analysis</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <Stat label="Monthly Saving Required" value={F(goalRes.monthlyRequired, currency)} />
                                    <Stat label="Total Contribution" value={F(goalRes.totalContribution, currency)} />
                                    <Stat label="Interest Earned" value={F(goalRes.interestEarned, currency)} sub="Returns to you" />
                                </div>
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Progress vs Target</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={goalRes.yearlyProgress} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="year" tick={CHART_STYLE} tickLine={false} />
                                        <YAxis tick={CHART_STYLE} tickLine={false} width={60} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Line type="monotone" dataKey="saved" stroke="#14b8a6" strokeWidth={2.5} dot={false} name="Saved" />
                                        <Line type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Target" strokeDasharray="6 3" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tax Estimator ──────────────────────────────────────────────── */}
            {activeTab === 'tax' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Income Tax Estimator</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">India — New &amp; Old Regime FY 2024-25 (with 4% cess)</p>
                        <div className="space-y-4">
                            <Input label="Gross Annual Income" type="number" placeholder="e.g. 1200000" value={tax.income} onChange={e => setTax({ ...tax, income: e.target.value })} />
                            <Select label="Tax Regime" value={tax.regime} onChange={e => setTax({ ...tax, regime: e.target.value })} options={[{ value: 'new', label: 'New Regime (default — ₹75k std. deduction)' }, { value: 'old', label: 'Old Regime (₹50k std. deduction)' }]} />
                            <div className="p-4 bg-gray-50 dark:bg-dark-300 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <p className="font-semibold text-gray-700 dark:text-gray-300">New Regime Slabs</p>
                                <p>Up to ₹3L — Nil | ₹3-7L — 5% | ₹7-10L — 10% | ₹10-12L — 15% | ₹12-15L — 20% | Above ₹15L — 30%</p>
                            </div>
                            <Button onClick={calcTax} fullWidth icon={ReceiptText}>Estimate Tax</Button>
                        </div>
                    </Card>
                    {taxRes && (
                        <div className="space-y-4">
                            <div className={`rounded-2xl p-5 bg-gradient-to-br ${GRAD.danger} text-white`}>
                                <h4 className="font-semibold mb-4">Tax Summary</h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Stat label="Total Tax Payable" value={F(taxRes.totalTax, currency)} sub={`Effective rate: ${taxRes.effectiveRate}%`} />
                                    <Stat label="In-Hand Income" value={F(taxRes.inHand, currency)} sub="After tax (annual)" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Stat label="Monthly In-Hand" value={F(Math.round(taxRes.inHand / 12), currency)} />
                                    <Stat label="Taxable Income" value={F(taxRes.taxable, currency)} sub="After std. deduction" />
                                </div>
                            </div>
                            <Card padding={false} className="px-4 py-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Income Breakdown</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'In-Hand', value: taxRes.inHand },
                                                { name: 'Tax + Cess', value: taxRes.totalTax },
                                            ]}
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip formatter={v => F(v, currency)} contentStyle={TOOLTIP_STYLE} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                            {/* Regime comparison tip */}
                            <Card padding={false} className="px-4 py-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800">
                                <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-1">💡 Regime Tip</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    New regime is better if you have fewer deductions (&lt;₹1.5L in 80C etc.). Old regime benefits those with HRA, home loan interest &amp; 80C deductions.
                                    Switch calculation to compare both.
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Calculators;