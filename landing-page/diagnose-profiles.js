require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function diagnose() {
  try {
    console.log('Fetching first profile to see available columns...\n');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error('Error fetching profiles:', error);
      process.exit(1);
    }
    
    if (!data || data.length === 0) {
      console.log('No profiles found');
      return;
    }
    
    const profile = data[0];
    console.log('Available columns in profiles table:');
    Object.keys(profile).forEach(col => {
      console.log(`  - ${col}: ${typeof profile[col]} = ${JSON.stringify(profile[col])}`);
    });
    
    console.log('\n\nAll profiles summary:');
    const { data: allProfiles } = await supabase.from('profiles').select('id, email, subscription_tier');
    allProfiles.forEach(p => {
      console.log(`  ${p.email || p.id}: subscription_tier = ${p.subscription_tier}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

diagnose();
