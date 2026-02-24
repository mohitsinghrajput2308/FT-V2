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
