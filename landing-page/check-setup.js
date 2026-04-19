require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkUsers() {
  try {
    console.log('Checking auth.users...\n');
    
    // Get all tables to see what exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      console.log('Public tables:');
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    }
    
    // Try to read profiles with RLS disabled (use service role would be ideal, but we don't have it)
    console.log('\nTrying to count profiles...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total profiles: ${count || 0}`);
    if (countError) console.log(`Error: ${countError.message}`);
    
    // Check current user
    console.log('\nCurrent session:');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log(`Session: ${session ? `User ${session.user.email}` : 'None'}`);
    if (sessionError) console.log(`Error: ${sessionError.message}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers();
