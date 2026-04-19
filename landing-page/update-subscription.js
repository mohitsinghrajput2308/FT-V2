require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function updateSubscription() {
  try {
    // Query all profiles to see current state
    const { data: profiles, error: err1 } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier');
    
    if (err1) {
      console.error('Error fetching profiles:', err1);
      process.exit(1);
    }
    
    console.log('Current profiles:');
    profiles.forEach(p => {
      console.log(`  ${p.email || p.id}: ${p.subscription_tier}`);
    });
    
    // Find the target user
    const user = profiles.find(p => p.email === 'storagearea0101010101010@gmail.com');
    if (!user) {
      console.log('\nUser not found');
      process.exit(1);
    }
    
    console.log(`\nUpdating user: ${user.id}`);
    
    // Update subscription tier to business
    const { data, error: err2 } = await supabase
      .from('profiles')
      .update({ subscription_tier: 'business' })
      .eq('id', user.id)
      .select();
    
    if (err2) {
      console.error('Update error:', err2);
      process.exit(1);
    }
    
    console.log('✅ Updated successfully!');
    console.log('New subscription tier:', data[0].subscription_tier);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateSubscription();
