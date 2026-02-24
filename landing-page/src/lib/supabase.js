/**
 * Supabase Client — shared between the landing page and the main finance-tracker app.
 * Credentials are loaded from REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
 * defined in the .env file at the root of this project.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[FinTrack] Missing Supabase credentials.\n' +
        'Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
    );
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
);
