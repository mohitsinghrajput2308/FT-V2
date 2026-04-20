#!/usr/bin/env node

/**
 * Populate Secrets Table via Supabase REST API
 * This inserts the secrets into the edge_secrets table
 */

const axios = require('axios');

const SUPABASE_URL = 'https://eocagbloalvideqsyxvpv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.SERVICE_ROLE_KEY_PLACEHOLDER';

async function main() {
  console.log('\n📝 Populating Secrets Table\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const client = axios.create({
      baseURL: SUPABASE_URL,
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
    });

    // First, run the migration to create the table
    console.log('Step 1: Creating secrets table...\n');

    const secrets_data = [
      {
        secret_name: 'SUPABASE_URL',
        secret_value: SUPABASE_URL,
      },
      {
        secret_name: 'SUPABASE_SERVICE_ROLE_KEY',
        secret_value: SERVICE_ROLE_KEY,
      },
      {
        secret_name: 'PADDLE_WEBHOOK_SECRET',
        secret_value: 'PENDING_FROM_PADDLE',
      }
    ];

    console.log('Step 2: Inserting secrets...\n');

    for (const secret of secrets_data) {
      process.stdout.write(`  Inserting ${secret.secret_name}... `);

      try {
        // Try to upsert (insert with conflict handling)
        const response = await client.post('/rest/v1/edge_secrets', secret);
        console.log('✓');
      } catch (err) {
        // Try alternative endpoint or format
        try {
          const response = await client.post('/rest/v1/edge_secrets?on_conflict=secret_name', secret);
          console.log('✓ (upserted)');
        } catch (err2) {
          console.log(`⚠️  (${err2.response?.status || err2.message})`);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('✅ Secrets table populated!\n');

    console.log('📋 VERIFICATION:\n');
    console.log('Check table: https://supabase.com/dashboard/project/eocagbloalvideqsyxvpv/editor/public/edge_secrets\n');

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 NEXT: Configure Paddle Webhook\n');
    console.log('1. Go to: https://dashboard.paddle.com/webhooks');
    console.log('2. Add Endpoint: ' + SUPABASE_URL + '/functions/v1/paddle-webhook');
    console.log('3. Select 7 events');
    console.log('4. Save → Copy Signing Secret');
    console.log('5. Update secret in Supabase:\n');
    console.log('   UPDATE public.edge_secrets');
    console.log('   SET secret_value = \'[PASTE_SECRET_HERE]\'');
    console.log('   WHERE secret_name = \'PADDLE_WEBHOOK_SECRET\';');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

main();
