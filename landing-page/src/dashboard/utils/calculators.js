/**
 * Financial calculator functions
 */

/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} tenure - Loan tenure in months
 * @returns {Object} EMI details
 */
export const calculateEMI = (principal, rate, tenure) => {
    if (principal <= 0 || tenure <= 0) {
        return { emi: 0, totalPayment: 0, totalInterest: 0 };
    }

    if (rate <= 0) {
        const emi = principal / tenure;
        return { emi, totalPayment: principal, totalInterest: 0 };
    }

    const monthlyRate = rate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
        (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;

    return {
        emi: Math.round(emi * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
    };
};

/**
 * Calculate SIP (Systematic Investment Plan) returns
 * @param {number} monthlyInvestment - Monthly SIP amount
 * @param {number} expectedReturn - Expected annual return rate (percentage)
 * @param {number} years - Investment period in years
 * @returns {Object} SIP details
 */
export const calculateSIP = (monthlyInvestment, expectedReturn, years) => {
    if (monthlyInvestment <= 0 || years <= 0) {
        return { futureValue: 0, invested: 0, returns: 0 };
    }

    const months = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    const invested = monthlyInvestment * months;

    let futureValue;
    if (expectedReturn <= 0) {
        futureValue = invested;
    } else {
        futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }

    const returns = futureValue - invested;

    return {
        futureValue: Math.round(futureValue),
        invested: Math.round(invested),
        returns: Math.round(returns)
    };
};

/**
 * Calculate Compound Interest
 * @param {number} principal - Initial amount
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} time - Time period in years
 * @param {number} frequency - Compounding frequency per year (1=yearly, 4=quarterly, 12=monthly)
 * @returns {Object} Compound interest details
 */
export const calculateCompoundInterest = (principal, rate, time, frequency = 12) => {
    if (principal <= 0 || time <= 0) {
        return { amount: 0, interest: 0 };
    }

    if (rate <= 0) {
        return { amount: principal, interest: 0 };
    }

    const r = rate / 100;
    const n = frequency;
    const amount = principal * Math.pow(1 + r / n, n * time);
    const interest = amount - principal;

    return {
        amount: Math.round(amount * 100) / 100,
        interest: Math.round(interest * 100) / 100
    };
};

/**
 * Calculate Lumpsum investment returns
 * @param {number} investment - Lumpsum amount
 * @param {number} rate - Expected annual return rate
 * @param {number} years - Investment period
 * @returns {Object} Investment details
 */
export const calculateLumpsum = (investment, rate, years) => {
    if (investment <= 0 || years <= 0) {
        return { futureValue: 0, returns: 0 };
    }

    const futureValue = investment * Math.pow(1 + rate / 100, years);
    const returns = futureValue - investment;

    return {
        futureValue: Math.round(futureValue),
        returns: Math.round(returns)
    };
};

/**
 * Calculate Fixed Deposit maturity with year-by-year breakdown
 */
export const calculateFD = (principal, rate, years, frequency = 4) => {
    if (principal <= 0 || years <= 0) return { maturity: 0, interest: 0, yearlyBreakdown: [] };
    const r = rate / 100;
    const n = frequency;
    const yearlyBreakdown = [];
    for (let y = 1; y <= Math.min(years, 30); y++) {
        const amount = principal * Math.pow(1 + r / n, n * y);
        yearlyBreakdown.push({ year: `Yr ${y}`, amount: Math.round(amount), interest: Math.round(amount - principal) });
    }
    const maturity = principal * Math.pow(1 + r / n, n * years);
    return {
        maturity: Math.round(maturity * 100) / 100,
        interest: Math.round((maturity - principal) * 100) / 100,
        yearlyBreakdown,
    };
};

/**
 * Calculate Retirement Corpus
 * @param {number} currentAge
 * @param {number} retireAge
 * @param {number} monthlyExpense - Current monthly expense (inflated at 6% pa)
 * @param {number} currentSavings - Already saved amount
 * @param {number} monthlySaving - Monthly contribution going forward
 * @param {number} returnRate - Expected annual return on investments
 */
export const calculateRetirement = (currentAge, retireAge, monthlyExpense, currentSavings, monthlySaving, returnRate) => {
    const years = retireAge - currentAge;
    if (years <= 0) return { corpus: 0, required: 0, shortfall: 0, yearlyGrowth: [] };

    const inflationRate = 6;
    const inflatedExpense = monthlyExpense * Math.pow(1 + inflationRate / 100, years);
    const requiredCorpus = inflatedExpense * 12 * 25; // 4% withdrawal rule → 25x annual

    // Current savings grows
    const savingsGrowth = currentSavings * Math.pow(1 + returnRate / 100, years);

    // SIP contribution
    const months = years * 12;
    const mr = returnRate / 12 / 100;
    const sipFV = mr > 0
        ? monthlySaving * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr)
        : monthlySaving * months;

    const projectedCorpus = savingsGrowth + sipFV;
    const shortfall = Math.max(0, requiredCorpus - projectedCorpus);

    const yearlyGrowth = [];
    for (let y = 1; y <= years; y++) {
        const sg = currentSavings * Math.pow(1 + returnRate / 100, y);
        const m = y * 12;
        const sip = mr > 0 ? monthlySaving * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr) : monthlySaving * m;
        yearlyGrowth.push({ year: `Age ${currentAge + y}`, corpus: Math.round(sg + sip) });
    }

    return {
        corpus: Math.round(projectedCorpus),
        required: Math.round(requiredCorpus),
        shortfall: Math.round(shortfall),
        yearlyGrowth,
    };
};

/**
 * Calculate required monthly saving to reach a goal
 */
export const calculateSavingsGoal = (targetAmount, currentSavings, years, returnRate) => {
    if (years <= 0 || targetAmount <= 0) return { monthlyRequired: 0, totalContribution: 0, interestEarned: 0, yearlyProgress: [] };

    const months = years * 12;
    const mr = returnRate / 12 / 100;

    // Future value of existing savings
    const existingFV = currentSavings * Math.pow(1 + returnRate / 100, years);
    const remaining = Math.max(0, targetAmount - existingFV);

    let monthlyRequired = 0;
    if (mr > 0 && remaining > 0) {
        monthlyRequired = remaining * mr / ((Math.pow(1 + mr, months) - 1) * (1 + mr));
    } else if (remaining > 0) {
        monthlyRequired = remaining / months;
    }

    const totalContribution = monthlyRequired * months + currentSavings;
    const interestEarned = targetAmount - totalContribution;

    const yearlyProgress = [];
    for (let y = 1; y <= years; y++) {
        const ef = currentSavings * Math.pow(1 + returnRate / 100, y);
        const m = y * 12;
        const sip = mr > 0 ? monthlyRequired * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr) : monthlyRequired * m;
        yearlyProgress.push({ year: `Yr ${y}`, saved: Math.round(ef + sip), target: targetAmount });
    }

    return {
        monthlyRequired: Math.round(monthlyRequired),
        totalContribution: Math.round(totalContribution),
        interestEarned: Math.max(0, Math.round(interestEarned)),
        yearlyProgress,
    };
};

/**
 * Calculate Personal Income Tax (India - New Regime FY 2024-25)
 */
export const calculateIncomeTax = (grossIncome, regime = 'new') => {
    const std = regime === 'old' ? 50000 : 75000;
    const taxable = Math.max(0, grossIncome - std);

    let tax = 0;
    if (regime === 'new') {
        const slabs = [[300000, 0], [400000, 0.05], [400000, 0.10], [400000, 0.15], [400000, 0.20], [Infinity, 0.30]];
        let rem = taxable;
        for (const [limit, rate] of slabs) {
            if (rem <= 0) break;
            const chunk = Math.min(rem, limit);
            tax += chunk * rate;
            rem -= chunk;
        }
    } else {
        const slabs = [[250000, 0], [250000, 0.05], [500000, 0.20], [Infinity, 0.30]];
        let rem = taxable;
        for (const [limit, rate] of slabs) {
            if (rem <= 0) break;
            const chunk = Math.min(rem, limit);
            tax += chunk * rate;
            rem -= chunk;
        }
    }

    const cess = tax * 0.04;
    const totalTax = Math.round(tax + cess);
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
    const inHand = grossIncome - totalTax;

    return { totalTax, effectiveRate: parseFloat(effectiveRate.toFixed(2)), inHand, taxable };
};
