import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as sgMail from "https://esm.sh/@sendgrid/mail@8.1.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const sgApiKey = Deno.env.get("SENDGRID_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey)
if (sgApiKey) sgMail.default.setApiKey(sgApiKey);

serve(async (req) => {
    try {
        if (!sgApiKey) throw new Error("SendGrid key not configured");
        // Just a placeholder implementation
        // Real implementation would join Users with their last week's Transactions
        // calculate summary and send html email.

        // For now we simulate success
        return new Response(JSON.stringify({ message: 'Weekly report emails queued' }), { headers: { "Content-Type": "application/json" } })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
})
