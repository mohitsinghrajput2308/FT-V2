require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  try {
    console.log('Attempting insert into feedback_submissions...');
    const payload = {
      name: 'Automated Test',
      email: 'test+supabase@example.com',
      type: 'General Feedback',
      feedback: 'Automated test insertion - ignore',
    };
    const { data, error } = await supabase.from('feedback_submissions').insert([payload]).select();
    if (error) {
      console.error('Insert error:', error);
      process.exit(2);
    }
    console.log('Insert succeeded, returned rows:', data);
  } catch (err) {
    console.error('Exception during insert:', err);
    process.exit(3);
  }
})();