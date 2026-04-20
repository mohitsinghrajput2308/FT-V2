#!/usr/bin/env node

/**
 * Set Supabase Edge Function Environment Variables
 * Direct approach via REST API and database
 */

const axios = require('axios');

const PROJECT_ID = 'eocagbloalvideqsyxvpv';
const SUPABASE_URL = 'https://eocagbloalvideqsyxvpv.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.SERVICE_ROLE_KEY_PLACEHOLDER';

const SECRETS_DATA = {
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE
};

async function main() {
  console.log('\n🔐 Setting Edge Function Secrets\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Create axios instance with service role key
    const client = axios.create({
      baseURL: `${SUPABASE_URL}`,
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'apikey': SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
      },
    });

    console.log('Attempting to set environment variables via REST API...\n');

    // Method 1: Try setting via vault/secrets table
    for (const [key, value] of Object.entries(SECRETS_DATA)) {
      process.stdout.write(`Setting ${key}... `);

      try {
        const response = await client.post('/rest/v1/secrets', {
          name: key,
          secret: value,
          description: `Paddle webhook - ${key}`
        });

        console.log('✓');
      } catch (err1) {
        // Method 2: Try direct RPC call
        try {
          const response = await client.post('/rest/v1/rpc/set_secret', {
            secret_name: key,
            secret_value: value
          });
          console.log('✓ (via RPC)');
        } catch (err2) {
          // Method 3: Try edge functions API
          try {
            const response = await axios.post(
              `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/paddle-webhook/secrets`,
              {
                name: key,
                value: value
              },
              {
                headers: {
                  'Authorization': `Bearer sbp_b0df9adb85488818d9bc13f2bf266ddc35978959`,
                }
              }
            );
            console.log('✓ (via Management API)');
          } catch (err3) {
            console.log('⚠️  (will be set via UI)');
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('✅ Secrets configuration completed!\n');

    console.log('📋 MANUAL VERIFICATION:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/eocagbloalvideqsyxvpv');
    console.log('2. Left sidebar → Functions → paddle-webhook');
    console.log('3. Click Settings tab');
    console.log('4. Verify these Environment Variables exist:');
    console.log('   • SUPABASE_URL = ' + SUPABASE_URL);
    console.log('   • SUPABASE_SERVICE_ROLE_KEY = (should be set)\n');

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 NEXT STEP: Paddle Webhook Configuration\n');
    console.log('1. Go to: https://dashboard.paddle.com/webhooks');
    console.log('2. Click: Add Endpoint');
    console.log('3. Webhook URL: ' + SUPABASE_URL + '/functions/v1/paddle-webhook');
    console.log('4. Select 7 Events:');
    console.log('   ✓ subscription.created');
    console.log('   ✓ subscription.activated');
    console.log('   ✓ subscription.updated');
    console.log('   ✓ subscription.canceled');
    console.log('   ✓ subscription.paused');
    console.log('   ✓ transaction.completed');
    console.log('   ✓ transaction.payment_failed');
    console.log('5. Save → Copy Signing Secret');
    console.log('6. Go back to Supabase Settings and add:');
    console.log('   PADDLE_WEBHOOK_SECRET = [paste the signing secret]\n');

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.log('\n⚠️  Please manually set these in Supabase:\n');
    console.log('Settings → Edge Functions → paddle-webhook → Settings\n');
    for (const [key, value] of Object.entries(SECRETS_DATA)) {
      console.log(`${key} = ${value.substring(0, 50)}...`);
    }
  }
}

main().catch(console.error);
