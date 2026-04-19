# DEPLOYMENT & INTEGRATION GUIDE

**Version:** 1.0  
**Date:** 2026-01-15  
**Target:** Production Deployment This Week  
**Owner:** Engineering Lead

---

## Quick Start: Deploy All Security Systems

### Step 1: Schedule Background Jobs (30 minutes)

```bash
# 1. Add key rotation to crontab
crontab -e

# Add this line:
0 3 * * * cd /app && node -r dotenv/config src/dashboard/security/key-rotation.js

# 2. Add monitoring checks to crontab
# Add this line:
*/5 * * * * cd /app && node -r dotenv/config src/dashboard/security/monitoring.js

# 3. Add backup integrity test to crontab
# Add this line (first Saturday of month at 22:00 UTC):
0 22 * * 6 cd /app && node -r dotenv/config src/dashboard/security/backup-recovery.js >> /var/log/fintrack-backup-test.log 2>&1

# Save crontab (Ctrl+O, Enter, Ctrl+X in nano)
```

### Step 2: Configure Environment Variables (15 minutes)

**In Vercel Dashboard:**
```
SLACK_WEBHOOK_SECURITY_ALERTS=https://hooks.slack.com/services/T.../B.../...
SLACK_WEBHOOK_INCIDENTS=https://hooks.slack.com/services/T.../B.../...
BACKUP_PASSWORD=[secure random string - generates encryption key]
SENDGRID_API_KEY=[SendGrid API key for breach notifications]
DB_BACKUP_S3_BUCKET=fintrack-backups
DB_BACKUP_S3_REGION=eu-west-1
AWS_ACCESS_KEY_ID=[IAM key with S3 access]
AWS_SECRET_ACCESS_KEY=[IAM secret]
```

**In `.env.local` (development only):**
```
SLACK_WEBHOOK_SECURITY_ALERTS=https://hooks.slack.com/services/...
BACKUP_PASSWORD=test-password-dev-only
SENDGRID_API_KEY=SG.xxx...
```

### Step 3: Create Required Database Tables (15 minutes)

```bash
# Connect to Supabase
psql postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Run migrations
\c fintrack

-- Key rotation log
CREATE TABLE IF NOT EXISTS key_rotation_log (
  id BIGSERIAL PRIMARY KEY,
  key_type VARCHAR(100) NOT NULL,
  old_key_hash VARCHAR(64),
  new_key_hash VARCHAR(64),
  rotated_by VARCHAR(100) DEFAULT 'automation',
  rotated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'success',
  notes TEXT
);

-- Deployment log (for change management)
CREATE TABLE IF NOT EXISTS deployment_log (
  id BIGSERIAL PRIMARY KEY,
  change_id VARCHAR(20) UNIQUE,
  commit_hash VARCHAR(40),
  deployed_by VARCHAR(100),
  deployed_at TIMESTAMP DEFAULT NOW(),
  environment VARCHAR(20),
  status VARCHAR(20),
  description TEXT,
  approver_1 VARCHAR(100),
  approver_2 VARCHAR(100),
  rollback_executed BOOLEAN DEFAULT FALSE,
  rollback_time TIMESTAMP,
  reason_rollback TEXT
);

-- Monitor log (for threat detection)
CREATE TABLE IF NOT EXISTS monitoring_log (
  id BIGSERIAL PRIMARY KEY,
  threat_type VARCHAR(100),
  severity VARCHAR(20),
  affected_user_id UUID,
  affected_email VARCHAR(255),
  details JSONB,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Ensure audit_logs table exists (for GDPR controls)
-- This should already exist, but verify:
SELECT tablename FROM pg_tables WHERE tablename = 'audit_logs';
-- If not found, create it:
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on monitoring & key rotation tables
ALTER TABLE key_rotation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can insert/update
CREATE POLICY "Only system can update key rotation" ON key_rotation_log
  FOR ALL USING (current_setting('role') = 'postgres');

-- Verify tables created
\dt+ key_rotation_log
\dt+ deployment_log
\dt+ monitoring_log

-- Exit
\q
```

### Step 4: Configure AWS S3 for Backups (15 minutes)

```bash
# 1. Create S3 buckets
aws s3 mb s3://fintrack-backups --region eu-west-1
aws s3 mb s3://fintrack-backups-secondary --region eu-central-1

# 2. Enable versioning
aws s3api put-bucket-versioning \
  --bucket fintrack-backups \
  --versioning-configuration Status=Enabled \
  --region eu-west-1

# 3. Enable cross-region replication
aws s3api put-bucket-replication \
  --bucket fintrack-backups \
  --replication-configuration file://replication.json \
  --role arn:aws:iam::ACCOUNT:role/s3-replication-role \
  --region eu-west-1

# 4. Set lifecycle policy (auto-delete after 30/90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket fintrack-backups \
  --lifecycle-configuration file://lifecycle.json \
  --region eu-west-1

# 5. Verify
aws s3 ls s3://fintrack-backups --region eu-west-1
```

**replication.json:**
```json
{
  "Role": "arn:aws:iam::ACCOUNT:role/s3-replication-role",
  "Rules": [
    {
      "Status": "Enabled",
      "Priority": 1,
      "Filter": { "Prefix": "" },
      "Destination": {
        "Bucket": "arn:aws:s3:::fintrack-backups-secondary",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": { "Minutes": 15 }
        }
      }
    }
  ]
}
```

**lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Filter": { "Prefix": "db-exports/" },
      "Status": "Enabled",
      "Expiration": { "Days": 30 },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 7 }
    }
  ]
}
```

### Step 5: Test All Systems in Staging (30 minutes)

```bash
# 1. Deploy to staging
npm run deploy:staging

# 2. Test GDPR controls
curl -X POST https://staging.fintrack.app/api/user/gdpr-restrictions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"restrict_processing": true}'
# Expected: 200 OK, user_settings table updated

# 3. Test analytics isolation
# Go to https://staging.fintrack.app/dashboard
# Open DevTools → Network tab → Filter "google"
# Expected: No GA requests from dashboard page

# 4. Test monitoring (manually trigger alert)
# Simulate brute force: Try 10 failed logins with same email
# Expected: Slack alert in #security-alerts within 5 minutes

# 5. Test backup encryption
# Find staging bucket: aws s3 ls s3://fintrack-backups-staging/
# Download file: aws s3 cp s3://fintrack-backups-staging/backup.dump.enc .
# Try to decrypt: openssl enc -d -aes-256-cbc -in backup.dump.enc >> /dev/null
# Expected: Requires password, file not readable without password

# 6. Verify CSP headers
curl -I https://staging.fintrack.app | grep Content-Security-Policy
# Expected: Shows "script-src 'self' https://..." (NO unsafe-inline)

# If all tests pass → proceed to production
```

### Step 6: Deploy to Production (20 minutes)

```bash
# 1. Create backup
pg_dump --host=db.xxx.supabase.co \
        --username=postgres \
        --format=custom \
        fintrack > backup-pre-security-deploy.dump

# 2. Alert team
curl -X POST $SLACK_WEBHOOK \
  -d '{"text": "@channel Deploying security updates in 5 minutes. Expected uptime."}'

# 3. Deploy
npm run deploy-prod

# 4. Monitor
# Go to https://console.vercel.com/fintrack/logs
# Watch for errors in first 5 minutes
# Should see: "Deployment ready"

# 5. Run critical tests
curl -X GET https://fintrack.app/api/health \
  -H "Authorization: Bearer SERVICE_TOKEN"
# Expected: {"status": "healthy", "database": "connected", "cache": "ready"}

# 6. Verify GDPR controls operational
curl -X GET https://fintrack.app/dashboard/security/gdpr-status \
  -H "Authorization: Bearer JWT_TOKEN"
# Expected: {"restrict_processing": false, "no_analytics": false, ...}

# 7. Team confirmation
curl -X POST $SLACK_WEBHOOK \
  -d '{"text": "✅ Security deployment complete. Production healthy."}'
```

---

## File-by-File Integration

### Import Statements (Add to DashboardApp.jsx)

```javascript
// At top of file
import { useAnalyticsIsolation } from '../security/useAnalyticsIsolation';
import GDPRDataControls from '../security/GDPRDataControls';
import SecurityMonitoring from '../security/monitoring';
import KeyRotationManager from '../security/key-rotation';
import BreachNotificationSystem from '../security/breach-notification';

// In component body
export default function DashboardApp() {
  // Initialize analytics isolation
  useAnalyticsIsolation();
  
  // Show GDPR controls section
  return (
    <div className="dashboard">
      {/* ... existing content ... */}
      
      {/* Add GDPR section */}
      <section className="security-settings">
        <h2>Your Privacy Controls</h2>
        <GDPRDataControls />
      </section>
    </div>
  );
}

// In API route handler (backend)
// Handle GDPR control changes
app.post('/api/user/gdpr-restrictions', async (req, res) => {
  const { restrict_processing, no_analytics, no_marketing, no_profiling } = req.body;
  const userId = req.user.id;
  
  // Update settings
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([{
      user_id: userId,
      gdpr_restrictions: {
        restrict_processing,
        no_analytics,
        no_marketing,
        no_profiling
      },
      updated_at: new Date().toISOString(),
      updated_by_ip: req.ip
    }])
    .eq('user_id', userId);
  
  if (error) return res.status(400).json({ error });
  
  // Log to audit trail
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'GDPR_RESTRICTION_CHANGED',
    details: { gdpr_restrictions: req.body },
    ip_address: req.ip
  });
  
  return res.json({ success: true, ...data });
});
```

### Environment Variables (Vercel Dashboard)

Go to: Dashboard → Settings → Environment Variables

```
# Security monitoring
SLACK_WEBHOOK_SECURITY_ALERTS=https://hooks.slack.com/services/T.../...
SLACK_WEBHOOK_INCIDENTS=https://hooks.slack.com/services/T.../...

# Backup encryption
BACKUP_PASSWORD=<generate secure random: openssl rand -base64 32>

# Breach notifications
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=security@fintrack.app
SENDGRID_FROM_NAME=FinTrack Security

# AWS S3
DB_BACKUP_S3_BUCKET=fintrack-backups
DB_BACKUP_S3_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=<secret>

# Database
DATABASE_URL=postgresql://...

# Feature flags
FEATURE_GDPR_CONTROLS=true
FEATURE_MONITORING=true
FEATURE_KEY_ROTATION=true
```

---

## Testing Checklist

Before going live, verify:

**Functionality Tests:**
- [ ] GDPR controls save/restore correctly
- [ ] Analytics disabled on /dashboard/* (DevTools check)
- [ ] Crisp chat hidden on financial pages
- [ ] Key rotation task runs (check logs)
- [ ] Monitoring alerts fire correctly (test brute force)
- [ ] Backup created and encrypted (S3 visible)
- [ ] Change logs recorded (deployment_log table has entries)

**Security Tests:**
- [ ] CSP enforced (no unsafe-inline, DevTools check)
- [ ] TLS working (green lock in browser)
- [ ] No hardcoded secrets in code (git grep "password\|secret\|key" -- *.js)
- [ ] RLS policies active (try accessing other user's data - should fail)
- [ ] Audit logs immutable (try UPDATE audit_logs - should fail)

**Performance Tests:**
- [ ] Dashboard loads < 2 seconds
- [ ] GDPR controls UI responsive
- [ ] No new console errors
- [ ] N+1 queries fixed (DevTools Network)

**Compliance Tests:**
- [ ] Security page claims match implementation
- [ ] Privacy policy updated with analytics disclosure
- [ ] GDPR page references working links
- [ ] Links to frameworks available (SOC 2, INCIDENT_RESPONSE_PLAN, etc.)

---

## Rollback Procedures

### If Monitoring Breaks

```bash
# 1. Disable monitoring cron
crontab -e
# Comment out: */5 * * * * cd /app && node ... monitoring.js

# 2. Revert monitoring.js changes
git revert [commit-hash-of-monitoring.js]

# 3. Restart
npm run deploy-prod

# 4. Investigation (30 min)
# Check what went wrong
# Fix locally + test

# 5. Retry after 24 hours
```

### If GDPR Controls Break

```bash
# 1. Hide UI
# In DashboardApp.jsx, comment out: <GDPRDataControls />

# 2. Revert GDPRDataControls.jsx
git revert [commit-hash-of-gdpr]

# 3. Deploy
npm run deploy-prod

# 4. Investigation + fix (same day)

# 5. Retry next day
```

### If All Systems Break

```bash
# 1. Quick rollback to previous version
git revert HEAD~<N>  # Where N = number of commits back
npm run deploy-prod

# 2. Alert team
# Post in #incidents: "Security deployment rolled back, investigating"

# 3. Fix locally + test thoroughly
npm test && npm run build && npm run deploy:staging

# 4. Retry after 24 hours
```

---

## Post-Deployment Verification (1 Week)

Run daily for 7 days:

```bash
# Day 1-7: Morning check
./scripts/daily-security-check.sh

# Output should show:
# ✅ Monitoring active (last check < 10 min ago)
# ✅ No security alerts overnight
# ✅ All users able to login
# ✅ Dashboard responsive
# ✅ GDPR controls working
# ✅ Backups created successfully
# ✅ RLS enforced (no data leaks)
# ✅ Audit logs growing (normal rate)
```

**If any check fails:**
1. Investigate immediately
2. Create incident ticket
3. Notify security team
4. Don't hide the issue - escalate

---

## Success Criteria

✅ DEPLOYMENT SUCCESSFUL if:
- Zero production incidents
- All tests passing
- Team confident + satisfied
- No user complaints
- Security assertions verified
- Compliance frameworks updated

✅ ROLLBACK NEEDED if:
- Any production outage > 30 min
- Data integrity issues detected
- Security breach discovered
- Critical bug prevents normal use

---

## Support & Escalation

**Questions During Deployment:**
- Message: #engineering (engineers)

**Production Issues:**
- Alert: #incidents channel
- Page: CTO on-call

**Security Concerns:**
- Alert: #security-alerts
- Contact: security@fintrack.app

**Compliance Questions:**
- Contact: dpo@fintrack.app

---

**Ready to Deploy:** ✅ YES  
**Status:** APPROVED  
**Sign-Off:** Engineering Lead + Security Lead
