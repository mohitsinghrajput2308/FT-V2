const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eocagbloalvidegyxvpv.supabase.co',
  'REDACTED_SUPABASE_ANON_KEY'
);

async function fullDiagnostic() {
  try {
    console.log('=== SUPABASE DATABASE DIAGNOSTIC ===\n');
    
    // Try to get current user session
    console.log('1. Checking current session...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log(`   ✓ Logged in as: ${session.user.email}`);
      console.log(`   ✓ User ID: ${session.user.id}`);
    } else {
      console.log('   ✗ No session - not logged in');
    }
    
    // Check if profiles table exists and count rows
    console.log('\n2. Checking profiles table...');
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ✗ Error: ${error.message}`);
      } else {
        console.log(`   ✓ Profiles table exists`);
        console.log(`   ✓ Total rows: ${count}`);
      }
    } catch (e) {
      console.log(`   ✗ Exception: ${e.message}`);
    }
    
    // Try to read profiles without RLS (using anon key)
    console.log('\n3. Fetching profile data...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.log(`   ✗ Error: ${profileError.message}`);
    } else if (!profiles || profiles.length === 0) {
      console.log('   ✗ No profiles found in database');
    } else {
      console.log(`   ✓ Found ${profiles.length} profiles:`);
      profiles.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.email || p.id} - tier: ${p.subscription_tier || 'N/A'}`);
      });
    }
    
    // Check auth.users (might be blocked by RLS)
    console.log('\n4. Checking auth.users...');
    try {
      const { data: users, error: userError } = await supabase.auth.admin?.listUsers?.() || { data: null, error: 'Admin API not available' };
      
      if (users) {
        console.log(`   ✓ Found ${users.users?.length} auth users`);
        users.users?.forEach(u => console.log(`     - ${u.email}`));
      } else {
        console.log(`   ✗ ${userError || 'Cannot access admin API with anon key'}`);
      }
    } catch (e) {
      console.log(`   ✗ Cannot list users: ${e.message}`);
    }
    
    console.log('\n=== RECOMMENDATION ===');
    console.log('If profiles table is empty, manually run this in Supabase SQL Editor:\n');
    console.log(`INSERT INTO public.profiles (id, email, username, subscription_tier)
SELECT 
  id,
  email,
  split_part(email, '@', 1),
  'business'
FROM auth.users
ON CONFLICT (id) DO NOTHING;`);
    
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

fullDiagnostic();
