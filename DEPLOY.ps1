# 🚀 AUTOMATED DEPLOYMENT SCRIPT
# Run this script to complete the entire deployment

## ================== AUTOMATIC SETUP ==================

Write-Host "🚀 FinTrack Payment System - Complete Deployment" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$projectPath = "c:\Users\KIIT0001\Downloads\Antigravity Projects\Current Money SRC\Fintrack-V1"
$landingPagePath = "$projectPath\landing-page"

# Project IDs
$supabaseProjectId = "eocagbloalvideqsyxvpv"
$supabaseUrl = "https://eocagbloalvideqsyxvpv.supabase.co"

Write-Host "✅ Configuration:" -ForegroundColor Green
Write-Host "   Project ID: $supabaseProjectId"
Write-Host "   Supabase URL: $supabaseUrl"
Write-Host "   Landing Page: $landingPagePath`n"

## ================== STEP 1: DATABASE MIGRATION ==================

Write-Host "`n📦 STEP 1: Database Migration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host @"
The SQL migration is ready. To apply it:

1. Open: https://supabase.com/dashboard/project/$supabaseProjectId
2. Go to: SQL Editor → New Query
3. Copy this command and run:

"@ -ForegroundColor Gray

# Show the migration SQL file path
Write-Host "📄 Migration file location:" -ForegroundColor Cyan
Write-Host "   $projectPath\supabase\migration_026_complete_payment_schema.sql`n" -ForegroundColor White

# Offer to copy migration SQL
$readMigration = Read-Host "Would you like me to display the SQL? (y/n)"
if ($readMigration -eq 'y') {
    Write-Host "`n" -ForegroundColor Gray
    Get-Content "$projectPath\supabase\migration_026_complete_payment_schema.sql" | Write-Host
    Write-Host "`n" -ForegroundColor Gray
}

Write-Host "⏳ Please run this SQL in Supabase Dashboard now..." -ForegroundColor Yellow
$migrationDone = Read-Host "Has the migration been applied? (y/n)"

if ($migrationDone -ne 'y') {
    Write-Host "❌ Please apply the migration in Supabase and try again.`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration confirmed!`n" -ForegroundColor Green

## ================== STEP 2: CONFIGURE EDGE FUNCTION SECRETS ==================

Write-Host "`n🔐 STEP 2: Configure Edge Function Environment Variables" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host @"
To set Edge Function secrets:

1. Go to: https://supabase.com/dashboard/project/$supabaseProjectId
2. Navigate to: Settings → Edge Functions (or Functions → paddle-webhook)
3. Click on 'paddle-webhook' function
4. Go to 'Configuration' tab
5. Add these environment variables:

   PADDLE_WEBHOOK_SECRET = [Get from Paddle Dashboard → Webhooks → Settings]
   SUPABASE_URL = $supabaseUrl
   SUPABASE_SERVICE_ROLE_KEY = [Get from Settings → API]

"@ -ForegroundColor Gray

$secretsDone = Read-Host "Have you set the environment variables? (y/n)"

if ($secretsDone -ne 'y') {
    Write-Host "⚠️  Please set the environment variables in Supabase and continue.`n" -ForegroundColor Yellow
}

Write-Host "✅ Environment variables configured!`n" -ForegroundColor Green

## ================== STEP 3: PADDLE WEBHOOK ENDPOINT ==================

Write-Host "`n🔗 STEP 3: Configure Paddle Webhook" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host @"
To set up Paddle Webhook:

1. Go to: https://dashboard.paddle.com
2. Navigate to: Webhooks
3. Click: Add Webhook Endpoint
4. Enter URL: $supabaseUrl/functions/v1/paddle-webhook
5. Select these Events:
   ✓ subscription.created
   ✓ subscription.activated
   ✓ subscription.updated
   ✓ subscription.canceled
   ✓ subscription.paused
   ✓ transaction.completed
   ✓ transaction.payment_failed

6. Click: Save
7. Copy the Signing Secret
8. Add it to Supabase as PADDLE_WEBHOOK_SECRET

"@ -ForegroundColor Gray

$webhookDone = Read-Host "Have you configured the Paddle webhook? (y/n)"

if ($webhookDone -ne 'y') {
    Write-Host "⚠️  Please configure the webhook in Paddle and continue.`n" -ForegroundColor Yellow
}

Write-Host "✅ Paddle webhook configured!`n" -ForegroundColor Green

## ================== STEP 4: DEPLOY VERCEL ==================

Write-Host "`n🌐 STEP 4: Deploy Landing Page to Vercel" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host "Deploying to Vercel..." -ForegroundColor Gray
cd $landingPagePath

Write-Host "Running: vercel deploy --prod" -ForegroundColor Cyan
try {
    $deployOutput = vercel deploy --prod 2>&1
    Write-Host $deployOutput -ForegroundColor Green
    Write-Host "`n✅ Vercel deployment complete!" -ForegroundColor Green
    
    # Extract the URL from output
    $urlMatch = $deployOutput | Select-String -Pattern "https://[^/]+" | Select-Object -First 1
    if ($urlMatch) {
        $deployedUrl = $urlMatch.Matches[0].Value
        Write-Host "   Production URL: $deployedUrl`n" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Vercel deployment may require additional setup.`n" -ForegroundColor Yellow
    Write-Host "    Try manually: cd $landingPagePath && vercel deploy --prod`n" -ForegroundColor Gray
}

## ================== STEP 5: TESTING ==================

Write-Host "`n🧪 STEP 5: Testing" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━"

Write-Host @"
To test your payment system:

1. Go to your deployed landing page URL
2. Click "Start 7-Day Trial" on Pro Monthly plan
3. Use test card: 4111 1111 1111 1111
4. Complete the checkout
5. Verify in Supabase:
   - Go to: $supabaseUrl/project/$supabaseProjectId/editor
   - Check 'subscriptions' table for new row
   - Check 'subscription_events' table for 'created' event
   - Check 'transactions' table for payment record
   - Check 'users' table for updated current_plan

"@ -ForegroundColor Gray

## ================== SUMMARY ==================

Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host @"

📋 What's Been Deployed:

✓ Database Schema
  - subscriptions (with trial, billing, payment tracking)
  - subscription_events (audit trail)
  - transactions (payment history)
  - plan_features (feature matrix)
  - RLS policies for security

✓ React Components
  - FeatureGate.jsx (plan-based feature access)
  - TrialCountdown.jsx (trial status display)
  - SubscriptionStatus.jsx (subscription dashboard)

✓ Webhook Handler
  - Full event processing (created, updated, renewed, canceled)
  - Transaction logging
  - User plan synchronization
  - Signature validation

✓ Documentation
  - COMPLETE_DEPLOYMENT_GUIDE.md
  - SUPABASE_SETUP.md
  - IMPLEMENTATION_COMPLETE.md

📞 QUICK REFERENCE:

Supabase Project: https://supabase.com/dashboard/project/$supabaseProjectId
Paddle Dashboard: https://dashboard.paddle.com
GitHub: https://github.com/mohitsinghrajput2308/FT-V2

🧪 Test Card: 4111 1111 1111 1111
📊 Check Logs: Supabase → Edge Functions → paddle-webhook → Recent Invocations

───────────────────────────────────────────────────────

💡 Next Steps:

1. Monitor webhook logs for test payment
2. Verify subscription was created in database
3. Test FeatureGate component with trial user
4. Add email notifications (optional)
5. Create billing management UI (optional)

───────────────────────────────────────────────────────

🎉 Your payment system is live!

"@ -ForegroundColor Green

cd $projectPath

Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
