import { useState } from 'react';
import { Calculator, Percent, TrendingUp, Coins } from 'lucide-react';
import { calculateEMI, calculateSIP, calculateCompoundInterest } from '../utils/calculators';
import { formatCurrency } from '../utils/helpers';
import { useFinance } from '../context/FinanceContext';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';

const Calculators = () => {
    const { currency } = useFinance();
    const [activeTab, setActiveTab] = useState('emi');

    // EMI Calculator State
    const [emiData, setEmiData] = useState({ principal: '', rate: '', tenure: '' });
    const [emiResult, setEmiResult] = useState(null);

    // SIP Calculator State
    const [sipData, setSipData] = useState({ monthly: '', rate: '', years: '' });
    const [sipResult, setSipResult] = useState(null);

    // Compound Interest State
    const [ciData, setCiData] = useState({ principal: '', rate: '', time: '', frequency: '12' });
    const [ciResult, setCiResult] = useState(null);

    const calculateEMIResult = () => {
        const { principal, rate, tenure } = emiData;
        if (principal && rate && tenure) {
            const result = calculateEMI(parseFloat(principal), parseFloat(rate), parseFloat(tenure));
            setEmiResult(result);
        }
    };

    const calculateSIPResult = () => {
        const { monthly, rate, years } = sipData;
        if (monthly && rate && years) {
            const result = calculateSIP(parseFloat(monthly), parseFloat(rate), parseFloat(years));
            setSipResult(result);
        }
    };

    const calculateCIResult = () => {
        const { principal, rate, time, frequency } = ciData;
        if (principal && rate && time) {
            const result = calculateCompoundInterest(
                parseFloat(principal),
                parseFloat(rate),
                parseFloat(time),
                parseInt(frequency)
            );
            setCiResult(result);
        }
    };

    const tabs = [
        { id: 'emi', label: 'EMI Calculator', icon: Calculator },
        { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
        { id: 'ci', label: 'Compound Interest', icon: Coins }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Calculators</h1>
                <p className="text-gray-500 dark:text-gray-400">Plan your finances with these calculators</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-400'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* EMI Calculator */}
            {activeTab === 'emi' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            EMI Calculator
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Calculate your Equated Monthly Installment for loans
                        </p>
                        <div className="space-y-4">
                            <Input
                                label="Loan Amount"
                                type="number"
                                placeholder="Enter loan amount"
                                value={emiData.principal}
                                onChange={(e) => setEmiData({ ...emiData, principal: e.target.value })}
                            />
                            <Input
                                label="Interest Rate (% per annum)"
                                type="number"
                                step="0.1"
                                placeholder="Enter interest rate"
                                value={emiData.rate}
                                onChange={(e) => setEmiData({ ...emiData, rate: e.target.value })}
                            />
                            <Input
                                label="Loan Tenure (months)"
                                type="number"
                                placeholder="Enter tenure in months"
                                value={emiData.tenure}
                                onChange={(e) => setEmiData({ ...emiData, tenure: e.target.value })}
                            />
                            <Button onClick={calculateEMIResult} fullWidth icon={Calculator}>
                                Calculate EMI
                            </Button>
                        </div>
                    </Card>

                    {emiResult && (
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <h3 className="text-lg font-semibold mb-6">EMI Results</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-lg">
                                    <p className="text-primary-100">Monthly EMI</p>
                                    <p className="text-3xl font-bold">{formatCurrency(emiResult.emi, currency)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-primary-100 text-sm">Total Payment</p>
                                        <p className="text-xl font-bold">{formatCurrency(emiResult.totalPayment, currency)}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-primary-100 text-sm">Total Interest</p>
                                        <p className="text-xl font-bold">{formatCurrency(emiResult.totalInterest, currency)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* SIP Calculator */}
            {activeTab === 'sip' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            SIP Calculator
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Calculate returns on your Systematic Investment Plan
                        </p>
                        <div className="space-y-4">
                            <Input
                                label="Monthly Investment"
                                type="number"
                                placeholder="Enter monthly amount"
                                value={sipData.monthly}
                                onChange={(e) => setSipData({ ...sipData, monthly: e.target.value })}
                            />
                            <Input
                                label="Expected Return Rate (% per annum)"
                                type="number"
                                step="0.1"
                                placeholder="Enter expected return rate"
                                value={sipData.rate}
                                onChange={(e) => setSipData({ ...sipData, rate: e.target.value })}
                            />
                            <Input
                                label="Investment Period (years)"
                                type="number"
                                placeholder="Enter period in years"
                                value={sipData.years}
                                onChange={(e) => setSipData({ ...sipData, years: e.target.value })}
                            />
                            <Button onClick={calculateSIPResult} fullWidth icon={TrendingUp}>
                                Calculate Returns
                            </Button>
                        </div>
                    </Card>

                    {sipResult && (
                        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
                            <h3 className="text-lg font-semibold mb-6">SIP Results</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-lg">
                                    <p className="text-success-100">Future Value</p>
                                    <p className="text-3xl font-bold">{formatCurrency(sipResult.futureValue, currency)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-success-100 text-sm">Total Invested</p>
                                        <p className="text-xl font-bold">{formatCurrency(sipResult.invested, currency)}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-success-100 text-sm">Total Returns</p>
                                        <p className="text-xl font-bold">{formatCurrency(sipResult.returns, currency)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Compound Interest Calculator */}
            {activeTab === 'ci' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Compound Interest Calculator
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Calculate compound interest on your investments
                        </p>
                        <div className="space-y-4">
                            <Input
                                label="Principal Amount"
                                type="number"
                                placeholder="Enter principal amount"
                                value={ciData.principal}
                                onChange={(e) => setCiData({ ...ciData, principal: e.target.value })}
                            />
                            <Input
                                label="Interest Rate (% per annum)"
                                type="number"
                                step="0.1"
                                placeholder="Enter interest rate"
                                value={ciData.rate}
                                onChange={(e) => setCiData({ ...ciData, rate: e.target.value })}
                            />
                            <Input
                                label="Time Period (years)"
                                type="number"
                                placeholder="Enter time period"
                                value={ciData.time}
                                onChange={(e) => setCiData({ ...ciData, time: e.target.value })}
                            />
                            <Select
                                label="Compounding Frequency"
                                value={ciData.frequency}
                                onChange={(e) => setCiData({ ...ciData, frequency: e.target.value })}
                                options={[
                                    { value: '1', label: 'Yearly' },
                                    { value: '2', label: 'Half-Yearly' },
                                    { value: '4', label: 'Quarterly' },
                                    { value: '12', label: 'Monthly' }
                                ]}
                            />
                            <Button onClick={calculateCIResult} fullWidth icon={Coins}>
                                Calculate Interest
                            </Button>
                        </div>
                    </Card>

                    {ciResult && (
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <h3 className="text-lg font-semibold mb-6">Compound Interest Results</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-lg">
                                    <p className="text-purple-100">Maturity Amount</p>
                                    <p className="text-3xl font-bold">{formatCurrency(ciResult.amount, currency)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-purple-100 text-sm">Principal</p>
                                        <p className="text-xl font-bold">{formatCurrency(parseFloat(ciData.principal), currency)}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <p className="text-purple-100 text-sm">Interest Earned</p>
                                        <p className="text-xl font-bold">{formatCurrency(ciResult.interest, currency)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default Calculators;
