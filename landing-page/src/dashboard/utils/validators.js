/**
 * Form validation functions
 */

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Please enter a valid email';
    return '';
};

export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
};

export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
    }
    return '';
};

export const validateNumber = (value, fieldName = 'Value', min = 0, max = Infinity) => {
    if (value === '' || value === null || value === undefined) {
        return `${fieldName} is required`;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (num > max) return `${fieldName} must be at most ${max}`;
    return '';
};

export const validateDate = (date, fieldName = 'Date') => {
    if (!date) return `${fieldName} is required`;
    const d = new Date(date);
    if (isNaN(d.getTime())) return `Please enter a valid ${fieldName.toLowerCase()}`;
    return '';
};

export const validateFutureDate = (date, fieldName = 'Date') => {
    const error = validateDate(date, fieldName);
    if (error) return error;
    if (new Date(date) < new Date()) return `${fieldName} must be in the future`;
    return '';
};

export const validateForm = (values, rules) => {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = values[field];
        let error = '';

        if (rule.required) {
            error = validateRequired(value, rule.label || field);
        }
        if (!error && rule.email) {
            error = validateEmail(value);
        }
        if (!error && rule.password) {
            error = validatePassword(value);
        }
        if (!error && rule.number) {
            error = validateNumber(value, rule.label || field, rule.min, rule.max);
        }
        if (!error && rule.date) {
            error = validateDate(value, rule.label || field);
        }
        if (!error && rule.futureDate) {
            error = validateFutureDate(value, rule.label || field);
        }
        if (!error && rule.custom) {
            error = rule.custom(value, values);
        }

        if (error) {
            errors[field] = error;
            isValid = false;
        }
    });

    return { errors, isValid };
};
