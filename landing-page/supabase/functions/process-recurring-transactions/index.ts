import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function calculateNextOccurrence(baseDate, frequency) {
    const date = new Date(baseDate);
    if (isNaN(date.getTime())) return null;

    switch (frequency) {
        case 'daily': date.setDate(date.getDate() + 1); break;
        case 'weekly': date.setDate(date.getDate() + 7); break;
        case 'monthly': date.setMonth(date.getMonth() + 1); break;
        case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
        default: return null;
    }
    return date.toISOString().split('T')[0];
}

serve(async (req) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Find all recurring transactions where next_occurrence <= today
        const { data: dueTransactions, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('is_recurring', true)
            .lte('next_occurrence', todayStr)

        if (fetchError) throw fetchError;
        if (!dueTransactions || dueTransactions.length === 0) {
            return new Response(JSON.stringify({ message: "No recurring transactions to process" }), { headers: { "Content-Type": "application/json" } });
        }

        const newTransactions = [];
        const updates = [];

        for (const trx of dueTransactions) {
            // Create duplicate
            delete trx.id;
            delete trx.created_at;
            const newTrx = {
                ...trx,
                date: todayStr, // Occurs today
                next_occurrence: calculateNextOccurrence(todayStr, trx.recurrence) // Next occurrence set from today
            };
            newTransactions.push(newTrx);

            // Update original to push next_occurrence forward and optionally disable its own recurrence if we want the new one to own it
            // Depending on design, you either keep the original as the "template" or the newest one becomes the template.
            // Assuming the newest becomes the template: 
            updates.push({
                id: trx.id,
                is_recurring: false, // Turn off recurrence on the older instance
                next_occurrence: null
            });
        }

        // Insert new transactions (which are now the active recurring ones)
        const { error: insertError } = await supabase.from('transactions').insert(newTransactions);
        if (insertError) throw insertError;

        // Update old ones
        for (const up of updates) {
            await supabase.from('transactions').update({ is_recurring: up.is_recurring, next_occurrence: up.next_occurrence }).eq('id', up.id);
        }

        return new Response(JSON.stringify({ message: `Processed ${dueTransactions.length} recurring transactions.` }), { headers: { "Content-Type": "application/json" } })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
})
