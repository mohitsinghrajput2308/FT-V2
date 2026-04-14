const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eocagbloalvidegyxvpv.supabase.co',
  'REDACTED_SUPABASE_ANON_KEY'
);

async function fixSubscriptions() {
  try {
    console.log('Fetching all profiles...\n');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, created_at');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      process.exit(1);
    }
    
    console.log('Current profiles:');
    if (profiles.length === 0) {
      console.log('  (No profiles found - database may not be set up)');
    } else {
      profiles.forEach(p => {
        console.log(`  ${p.email}: subscription_tier = '${p.subscription_tier}'`);
      });
    }
    
    console.log('\n\nTo enable Priority Support for paid users, run these SQL commands in Supabase SQL Editor:\n');
    console.log('UPDATE profiles SET subscription_tier = "business" WHERE email IN (SELECT email FROM profiles WHERE subscription_tier = "free");');
    console.log('\nOR manually update specific users:');
    console.log('UPDATE profiles SET subscription_tier = "business" WHERE email = "your-business-user@email.com";');
    console.log('UPDATE profiles SET subscription_tier = "pro" WHERE email = "your-pro-user@email.com";');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixSubscriptions();
