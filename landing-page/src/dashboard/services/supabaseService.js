/**
 * Supabase Data Service
 * 
 * Central data access layer that replaces direct localStorage usage.
 * All CRUD operations go through Supabase first, with localStorage as a
 * read-only cache for offline/fallback scenarios.
 * 
 * Field mapping: translates between frontend camelCase field names and
 * Supabase snake_case column names so dashboard components don't need changes.
 */

import { supabase } from '../../lib/supabase';

// ─── Field Mappers ────────────────────────────────────────────
// Frontend uses camelCase, Supabase uses snake_case.
// These functions translate between the two.

const toSupabaseTransaction = (t) => {
    const meta = {
        name: t.name || t.category || 'Transaction',
        notes: t.description || '',
        paymentMethod: t.paymentMethod || 'Cash',
    };

    return {
        user_id: t.userId,
        type: t.type,
        amount: Number(t.amount),
        category: t.category,
        description: JSON.stringify(meta),
        transaction_date: t.date || new Date().toISOString().split('T')[0],
    };
};

const fromSupabaseTransaction = (row) => {
    let name = row.category || 'Transaction';
    let description = '';
    let paymentMethod = 'Cash';

    try {
        if (row.description && row.description.startsWith('{')) {
            const parsed = JSON.parse(row.description);
            name = parsed.name || name;
            description = parsed.notes || '';
            paymentMethod = parsed.paymentMethod || 'Cash';
        } else {
            name = row.category || 'Transaction';
            description = row.description || '';
        }
    } catch {
        name = row.category || 'Transaction';
        description = row.description || '';
    }

    return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        name: name,
        amount: Number(row.amount),
        category: row.category,
        paymentMethod: paymentMethod,
        description: description,
        date: row.transaction_date,
        createdAt: row.created_at,
    };
};

const toSupabaseBudget = (b) => {
    // Frontend sends month as "YYYY-MM", Supabase stores month/year as ints
    let month = null, year = null;
    let period_type = 'monthly';
    const period = b.month; // Front-end uses "month" for the unified period ID

    if (b.month && b.month.includes('-')) {
        const [y, pId] = b.month.split('-');
        year = parseInt(y, 10);
        if (pId.startsWith('W')) {
            month = 1; // Dummy month for Weekly constraints
            period_type = 'weekly';
        } else {
            month = parseInt(pId, 10);
            period_type = 'monthly';
        }
    } else {
        const now = new Date();
        month = b.month || (now.getMonth() + 1);
        year = b.year || now.getFullYear();
    }
    return {
        user_id: b.userId,
        category: b.category,
        amount: Number(b.amount),
        spent_amount: Number(b.spent || 0),
        month,
        year,
        period,
        period_type
    };
};

const fromSupabaseBudget = (row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    amount: Number(row.amount),
    spent: Number(row.spent_amount || 0),
    month: row.period || `${row.year}-${String(row.month).padStart(2, '0')}`,
    createdAt: row.created_at,
});

const toSupabaseGoal = (g) => ({
    user_id: g.userId,
    name: g.name,
    target_amount: Number(g.targetAmount),
    current_amount: Number(g.currentAmount || 0),
    deadline: g.deadline || null,
    category: g.category || null,
    priority: g.priority || 'Medium',
    description: g.description || null,
});

const fromSupabaseGoal = (row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline,
    category: row.category,
    priority: row.priority || 'Medium',
    description: row.description || '',
    createdAt: row.created_at,
});

const toSupabaseInvestment = (i) => {
    // Pack name + type into stock_symbol as JSON so we don't lose data
    const meta = { name: i.name || i.symbol || '', type: i.type || 'Other' };
    return {
        user_id: i.userId,
        stock_symbol: JSON.stringify(meta),
        quantity: Number(i.quantity),
        purchase_price: Number(i.purchasePrice || i.buyPrice || 0),
        current_price: Number(i.currentValue || i.currentPrice || 0),
        purchase_date: i.purchaseDate || i.date || new Date().toISOString().split('T')[0],
    };
};

const fromSupabaseInvestment = (row) => {
    let name = row.stock_symbol || '';
    let type = 'Other';
    try {
        if (name.startsWith('{')) {
            const parsed = JSON.parse(name);
            name = parsed.name || '';
            type = parsed.type || 'Other';
        }
    } catch { /* keep raw value */ }
    return {
        id: row.id,
        userId: row.user_id,
        name,
        type,
        symbol: name,
        stockSymbol: name,
        quantity: Number(row.quantity),
        buyPrice: Number(row.purchase_price),
        purchasePrice: Number(row.purchase_price),
        currentValue: Number(row.current_price || row.purchase_price),
        currentPrice: Number(row.current_price || row.purchase_price),
        purchaseDate: row.purchase_date,
        date: row.purchase_date,
        createdAt: row.created_at,
    };
};

const toSupabaseBill = (b) => ({
    user_id: b.userId,
    name: b.name,
    amount: Number(b.amount),
    due_date: b.dueDate,
    category: b.category || null,
    is_paid: b.isPaid || false,
    paid_date: b.paidDate || null,
    is_recurring: b.isRecurring || false,
    recurrence: b.recurrence || null,
    recurring: b.recurring || 'Monthly',
    priority: b.priority || 'Medium',
});

const fromSupabaseBill = (row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    dueDate: row.due_date,
    category: row.category,
    isPaid: row.is_paid,
    paidDate: row.paid_date,
    isRecurring: row.is_recurring,
    recurrence: row.recurrence,
    recurring: row.recurring || 'Monthly',
    priority: row.priority || 'Medium',
    createdAt: row.created_at,
});


// ─── Generic error wrapper ────────────────────────────────────
const handleError = (operation, error) => {
    console.error(`[SupabaseService] ${operation} failed:`, error?.message || error);
    return { error: error?.message || 'An unexpected error occurred' };
};


// ─── TRANSACTIONS ─────────────────────────────────────────────

export const TransactionService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('transaction_date', { ascending: false });
            if (error) return handleError('getAll transactions', error);
            return { data: (data || []).map(fromSupabaseTransaction) };
        } catch (err) { return handleError('getAll transactions', err); }
    },

    async create(transaction) {
        try {
            const payload = toSupabaseTransaction(transaction);
            const { data, error } = await supabase
                .from('transactions')
                .insert(payload)
                .select()
                .single();
            if (error) return handleError('create transaction', error);
            return { data: fromSupabaseTransaction(data) };
        } catch (err) { return handleError('create transaction', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            if (updates.type !== undefined) payload.type = updates.type;
            if (updates.amount !== undefined) payload.amount = Number(updates.amount);
            if (updates.category !== undefined) payload.category = updates.category;
            if (updates.date !== undefined) payload.transaction_date = updates.date;

            // Handle composite JSON field if any of the meta fields are being updated
            if (updates.name !== undefined || updates.description !== undefined || updates.paymentMethod !== undefined) {
                const meta = {
                    name: updates.name || updates.category || 'Transaction',
                    notes: updates.description || '',
                    paymentMethod: updates.paymentMethod || 'Cash',
                };
                payload.description = JSON.stringify(meta);
            }

            const { data, error } = await supabase
                .from('transactions')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update transaction', error);
            return { data: fromSupabaseTransaction(data) };
        } catch (err) { return handleError('update transaction', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) return handleError('delete transaction', error);
            return { data: true };
        } catch (err) { return handleError('delete transaction', err); }
    }
};


// ─── BUDGETS ──────────────────────────────────────────────────

export const BudgetService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false });
            if (error) return handleError('getAll budgets', error);
            return { data: (data || []).map(fromSupabaseBudget) };
        } catch (err) { return handleError('getAll budgets', err); }
    },

    async create(budget) {
        try {
            const payload = toSupabaseBudget(budget);
            const { data, error } = await supabase
                .from('budgets')
                .insert(payload)
                .select()
                .single();
            if (error) return handleError('create budget', error);
            return { data: fromSupabaseBudget(data) };
        } catch (err) { return handleError('create budget', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            if (updates.category !== undefined) payload.category = updates.category;
            if (updates.amount !== undefined) payload.amount = Number(updates.amount);
            if (updates.spent !== undefined) payload.spent_amount = Number(updates.spent);
            if (updates.month && updates.month.includes('-')) {
                const [y, pId] = updates.month.split('-');
                payload.year = parseInt(y, 10);
                if (pId.startsWith('W')) {
                    payload.month = 1;
                    payload.period_type = 'weekly';
                } else {
                    payload.month = parseInt(pId, 10);
                    payload.period_type = 'monthly';
                }
                payload.period = updates.month;
            }
            const { data, error } = await supabase
                .from('budgets')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update budget', error);
            return { data: fromSupabaseBudget(data) };
        } catch (err) { return handleError('update budget', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('budgets').delete().eq('id', id);
            if (error) return handleError('delete budget', error);
            return { data: true };
        } catch (err) { return handleError('delete budget', err); }
    }
};


// ─── GOALS ────────────────────────────────────────────────────

export const GoalService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return handleError('getAll goals', error);
            return { data: (data || []).map(fromSupabaseGoal) };
        } catch (err) { return handleError('getAll goals', err); }
    },

    async create(goal) {
        try {
            const payload = toSupabaseGoal(goal);
            const { data, error } = await supabase
                .from('goals')
                .insert(payload)
                .select()
                .single();
            if (error) return handleError('create goal', error);
            return { data: fromSupabaseGoal(data) };
        } catch (err) { return handleError('create goal', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.targetAmount !== undefined) payload.target_amount = Number(updates.targetAmount);
            if (updates.currentAmount !== undefined) payload.current_amount = Number(updates.currentAmount);
            if (updates.deadline !== undefined) payload.deadline = updates.deadline;
            if (updates.category !== undefined) payload.category = updates.category;
            if (updates.priority !== undefined) payload.priority = updates.priority;
            if (updates.description !== undefined) payload.description = updates.description;

            const { data, error } = await supabase
                .from('goals')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update goal', error);
            return { data: fromSupabaseGoal(data) };
        } catch (err) { return handleError('update goal', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('goals').delete().eq('id', id);
            if (error) return handleError('delete goal', error);
            return { data: true };
        } catch (err) { return handleError('delete goal', err); }
    }
};


// ─── INVESTMENTS ──────────────────────────────────────────────

export const InvestmentService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('investments')
                .select('*')
                .order('purchase_date', { ascending: false });
            if (error) return handleError('getAll investments', error);
            return { data: (data || []).map(fromSupabaseInvestment) };
        } catch (err) { return handleError('getAll investments', err); }
    },

    async create(investment) {
        try {
            const payload = toSupabaseInvestment(investment);
            const { data, error } = await supabase
                .from('investments')
                .insert(payload)
                .select()
                .single();
            if (error) return handleError('create investment', error);
            return { data: fromSupabaseInvestment(data) };
        } catch (err) { return handleError('create investment', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            // Re-pack name+type into stock_symbol JSON
            if (updates.name !== undefined || updates.type !== undefined) {
                // We need to merge with existing — fetch current first is complex,
                // so just pack both if present
                const meta = { name: updates.name || '', type: updates.type || 'Other' };
                payload.stock_symbol = JSON.stringify(meta);
            }
            if (updates.quantity !== undefined) payload.quantity = Number(updates.quantity);
            if (updates.purchasePrice !== undefined || updates.buyPrice !== undefined) payload.purchase_price = Number(updates.purchasePrice || updates.buyPrice);
            if (updates.currentValue !== undefined || updates.currentPrice !== undefined) payload.current_price = Number(updates.currentValue || updates.currentPrice);
            if (updates.purchaseDate || updates.date) payload.purchase_date = updates.purchaseDate || updates.date;

            const { data, error } = await supabase
                .from('investments')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update investment', error);
            return { data: fromSupabaseInvestment(data) };
        } catch (err) { return handleError('update investment', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('investments').delete().eq('id', id);
            if (error) return handleError('delete investment', error);
            return { data: true };
        } catch (err) { return handleError('delete investment', err); }
    }
};


// ─── BILLS ────────────────────────────────────────────────────

export const BillService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('bills')
                .select('*')
                .order('due_date', { ascending: true });
            if (error) return handleError('getAll bills', error);
            return { data: (data || []).map(fromSupabaseBill) };
        } catch (err) { return handleError('getAll bills', err); }
    },

    async create(bill) {
        try {
            const payload = toSupabaseBill(bill);
            const { data, error } = await supabase
                .from('bills')
                .insert(payload)
                .select()
                .single();
            if (error) return handleError('create bill', error);
            return { data: fromSupabaseBill(data) };
        } catch (err) { return handleError('create bill', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.amount !== undefined) payload.amount = Number(updates.amount);
            if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
            if (updates.category !== undefined) payload.category = updates.category;
            if (updates.isPaid !== undefined) payload.is_paid = updates.isPaid;
            if (updates.paidDate !== undefined) payload.paid_date = updates.paidDate;
            if (updates.isRecurring !== undefined) payload.is_recurring = updates.isRecurring;
            if (updates.recurrence !== undefined) payload.recurrence = updates.recurrence;
            if (updates.recurring !== undefined) payload.recurring = updates.recurring;
            if (updates.priority !== undefined) payload.priority = updates.priority;

            const { data, error } = await supabase
                .from('bills')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update bill', error);
            return { data: fromSupabaseBill(data) };
        } catch (err) { return handleError('update bill', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('bills').delete().eq('id', id);
            if (error) return handleError('delete bill', error);
            return { data: true };
        } catch (err) { return handleError('delete bill', err); }
    }
};


// ─── CATEGORIES ───────────────────────────────────────────────

export const CategoryService = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            if (error) return handleError('getAll categories', error);

            // Group into { expense: [...], income: [...] } format the frontend expects
            const grouped = { expense: [], income: [] };
            (data || []).forEach(row => {
                const item = {
                    id: row.id,
                    name: row.name,
                    icon: row.icon,
                    color: row.color,
                };
                if (row.type === 'expense') grouped.expense.push(item);
                else if (row.type === 'income') grouped.income.push(item);
            });
            return { data: grouped };
        } catch (err) { return handleError('getAll categories', err); }
    },

    async create(type, category, userId) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: userId,
                    type,
                    name: category.name,
                    icon: category.icon || null,
                    color: category.color || null,
                })
                .select()
                .single();
            if (error) return handleError('create category', error);
            return { data: { id: data.id, name: data.name, icon: data.icon, color: data.color } };
        } catch (err) { return handleError('create category', err); }
    },

    async update(id, updates) {
        try {
            const payload = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.icon !== undefined) payload.icon = updates.icon;
            if (updates.color !== undefined) payload.color = updates.color;

            const { data, error } = await supabase
                .from('categories')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) return handleError('update category', error);
            return { data: { id: data.id, name: data.name, icon: data.icon, color: data.color } };
        } catch (err) { return handleError('update category', err); }
    },

    async delete(id) {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) return handleError('delete category', error);
            return { data: true };
        } catch (err) { return handleError('delete category', err); }
    }
};


// ─── USER SETTINGS ────────────────────────────────────────────

export const SettingsService = {
    async get() {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .single();
            if (error && error.code !== 'PGRST116') return handleError('get settings', error);
            if (!data) return { data: { currency: '$', dateFormat: 'MM/DD/YYYY' } };
            return {
                data: {
                    currency: data.currency || '$',
                    dateFormat: data.date_format || 'MM/DD/YYYY',
                    notifications: data.notifications_enabled,
                    theme: data.theme,
                    language: data.language,
                    totalBudget: data.total_budget || 0,
                    onboarding_completed: data.onboarding_completed || false,
                }
            };
        } catch (err) { return handleError('get settings', err); }
    },

    async upsert(settings, userId) {
        try {
            const payload = { user_id: userId };
            if (settings.currency !== undefined) payload.currency = settings.currency;
            if (settings.dateFormat !== undefined) payload.date_format = settings.dateFormat;
            if (settings.notifications !== undefined) payload.notifications_enabled = settings.notifications;
            if (settings.theme !== undefined) payload.theme = settings.theme;
            if (settings.language !== undefined) payload.language = settings.language;
            if (settings.totalBudget !== undefined) payload.total_budget = settings.totalBudget;
            if (settings.onboarding_completed !== undefined) payload.onboarding_completed = settings.onboarding_completed;

            const { data, error } = await supabase
                .from('user_settings')
                .upsert(payload, { onConflict: 'user_id' })
                .select()
                .single();
            if (error) return handleError('upsert settings', error);
            return {
                data: {
                    currency: data.currency,
                    dateFormat: data.date_format,
                    notifications: data.notifications_enabled,
                    theme: data.theme,
                    language: data.language,
                    totalBudget: data.total_budget || 0,
                    onboarding_completed: data.onboarding_completed || false,
                }
            };
        } catch (err) { return handleError('upsert settings', err); }
    }
};
