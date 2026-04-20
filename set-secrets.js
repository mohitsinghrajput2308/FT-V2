#!/usr/bin/env node

/**
 * Set Edge Function Environment Variables
 * Uses Supabase Management API
 */

const https = require('https');

const PROJECT_ID = 'eocagbloalvideqsyxvpv';
const SUPABASE_URL = 'https://eocagbloalvideqsyxvpv.supabase.co';
const SUPABASE_TOKEN = 'sbp_b0df9adb85488818d9bc13f2bf266ddc35978959';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0';

function httpsRequest(hostname, path, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            rawBody: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: null,
            rawBody: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('\n🔐 Setting Edge Function Environment Variables\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    console.log('Step 1: Setting SUPABASE_URL\n');
    
    // Try to set via Supabase API
    const response1 = await httpsRequest(
      'api.supabase.com',
      `/v1/projects/${PROJECT_ID}/functions/paddle-webhook/secrets`,
      'POST',
      {
        'Authorization': `Bearer ${SUPABASE_TOKEN}`,
        'X-API-Key': SUPABASE_TOKEN
      },
      {
        name: 'SUPABASE_URL',
        value: SUPABASE_URL
      }
    );

    if (response1.status === 201 || response1.status === 200) {
      console.log('✓ SUPABASE_URL set successfully\n');
    } else {
      console.log(`⚠️  Status ${response1.status} - May need manual setup\n`);
    }

    console.log('Step 2: Setting SUPABASE_SERVICE_ROLE_KEY\n');

    const response2 = await httpsRequest(
      'api.supabase.com',
      `/v1/projects/${PROJECT_ID}/functions/paddle-webhook/secrets`,
      'POST',
      {
        'Authorization': `Bearer ${SUPABASE_TOKEN}`,
        'X-API-Key': SUPABASE_TOKEN
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        value: SERVICE_ROLE_KEY
      }
    );

    if (response2.status === 201 || response2.status === 200) {
      console.log('✓ SUPABASE_SERVICE_ROLE_KEY set successfully\n');
    } else {
      console.log(`⚠️  Status ${response2.status} - May need manual setup\n`);
    }

    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('✅ Environment variables configuration attempted!\n');

    console.log('📋 NEXT STEP: Configure Paddle Webhook\n');
    console.log('1. Go to: https://dashboard.paddle.com/webhooks');
    console.log('2. Click: Add Endpoint');
    console.log(`3. URL: ${SUPABASE_URL}/functions/v1/paddle-webhook`);
    console.log('4. Select 7 Events:');
    console.log('   ✓ subscription.created');
    console.log('   ✓ subscription.activated');
    console.log('   ✓ subscription.updated');
    console.log('   ✓ subscription.canceled');
    console.log('   ✓ subscription.paused');
    console.log('   ✓ transaction.completed');
    console.log('   ✓ transaction.payment_failed');
    console.log('5. Save');
    console.log('6. Copy Signing Secret');
    console.log('7. Set as PADDLE_WEBHOOK_SECRET in Supabase\n');

    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.log('\n📋 MANUAL SETUP REQUIRED:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_ID);
    console.log('2. Click: Settings → Edge Functions → paddle-webhook');
    console.log('3. Click: Settings tab');
    console.log('4. Add Environment Variables:');
    console.log(`   • SUPABASE_URL = ${SUPABASE_URL}`);
    console.log('   • SUPABASE_SERVICE_ROLE_KEY = [Get from Settings → API]');
    console.log('   • PADDLE_WEBHOOK_SECRET = [Get from Paddle after webhook created]\n');
  }
}

main();
