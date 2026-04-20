#!/usr/bin/env node

/**
 * Set Edge Function Secrets - Direct Database Update via Service Role
 */

const https = require('https');
const querystring = require('querystring');

const PROJECT_ID = 'eocagbloalvideqsyxvpv';
const SUPABASE_URL = 'https://eocagbloalvideqsyxvpv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.SERVICE_KEY_LONG';
const FUNCTION_NAME = 'paddle-webhook';

const SECRETS = {
  'SUPABASE_URL': 'https://eocagbloalvideqsyxvpv.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.SERVICE_ROLE_KEY_FULL'
};

function httpsRequest(hostname, path, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = { hostname, port: 443, path, method, headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), rawBody: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: null, rawBody: data });
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
    // Try multiple API endpoints
    const endpoints = [
      `/v1/projects/${PROJECT_ID}/functions/${FUNCTION_NAME}/secrets`,
      `/functions/v1/${FUNCTION_NAME}/secrets`,
      `/rest/v1/functions_secrets?function_name=eq.${FUNCTION_NAME}`,
    ];

    let success = false;

    for (const endpoint of endpoints) {
      console.log(`Trying endpoint: ${endpoint}\n`);

      for (const [name, value] of Object.entries(SECRETS)) {
        try {
          const response = await httpsRequest(
            'api.supabase.com',
            endpoint,
            'POST',
            {
              'Content-Type': 'application/json',
              'Authorization': `Bearer sbp_b0df9adb85488818d9bc13f2bf266ddc35978959`,
            },
            { name, value }
          );

          if (response.status === 200 || response.status === 201 || response.status === 204) {
            console.log(`✓ ${name} set successfully\n`);
            success = true;
          } else {
            console.log(`⚠️  ${name} - Status ${response.status}\n`);
          }
        } catch (err) {
          console.log(`⚠️  ${name} - Error: ${err.message}\n`);
        }
      }

      if (success) break;
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    if (success) {
      console.log('✅ Secrets set via API!\n');
    } else {
      console.log('⚠️  API method failed. Using fallback...\n');
      console.log('📝 Adding MANUAL SQL approach:\n');
      console.log('If you have access to PostgreSQL, run this:\n');
      console.log(`INSERT INTO vault.secrets (name, secret, description) VALUES`);
      console.log(`  ('SUPABASE_URL', '${SECRETS['SUPABASE_URL']}', 'Supabase URL for webhook'),`);
      console.log(`  ('SUPABASE_SERVICE_ROLE_KEY', '${SECRETS['SUPABASE_SERVICE_ROLE_KEY']}', 'Service role key');\n`);
    }

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 NEXT: Configure Paddle Webhook\n');
    console.log('1. Go to: https://dashboard.paddle.com/webhooks');
    console.log('2. Add Endpoint: https://eocagbloalvideqsyxvpv.supabase.co/functions/v1/paddle-webhook');
    console.log('3. Select 7 events (subscription.*, transaction.*)');
    console.log('4. Save and copy Signing Secret');
    console.log('5. Set PADDLE_WEBHOOK_SECRET in Supabase Settings → Edge Functions → paddle-webhook → Settings\n');

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
  }
}

main();
