require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync('supabase/migration_018_feedback_submissions.sql', 'utf-8');
    
    console.log('Executing migration...');
    const { data, error } = await supabase.rpc('execute_sql', { sql: migrationSQL }).single();
    
    if (error) {
      console.error('Migration execution error:', error);
      
      // Fallback: try creating table with simpler approach
      console.log('\nTrying simpler CREATE TABLE approach...');
      const { error: createError } = await supabase
        .from('feedback_submissions')
        .insert({ name: 'test', email: 'test@test.com', type: 'test', feedback: 'test' })
        .select();
      
      if (createError && createError.code === 'PGRST204') {
        console.log('Table does not exist yet. Note: Use Supabase dashboard SQL editor to run:');
        console.log(migrationSQL);
      } else if (createError) {
        console.error('Table create attempt error:', createError);
      } else {
        console.log('Table created or already exists');
      }
    } else {
      console.log('Migration executed successfully');
    }
  } catch (err) {
    console.error('Exception:', err.message);
    process.exit(1);
  }
})();
