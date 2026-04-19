# Change Management Procedures

**Document Version:** 1.0  
**Last Updated:** 2026-01-15  
**Owner:** Engineering Lead  
**Compliance:** SOC 2 CC6.2, ISO 27001 A.12.1.2

---

## 1. Purpose

Establish formal procedures for managing all changes to FinTrack systems to:
- Prevent unauthorized modifications
- Ensure testing before production deployment
- Maintain system stability and security
- Track all changes for audit compliance
- Enable rapid rollback if issues arise

---

## 2. Change Classification

### Critical Changes (Immediate Approval Required)
- Database schema modifications
- Security policy updates
- Authentication/authorization logic changes
- Payment processing logic
- Data encryption keys or algorithms
- Infrastructure changes (Supabase, Vercel)
- TLS/SSL certificates
- API endpoint modifications

**Approval Chain:** Engineering Lead → Tech Lead → CTO

**Timeline:**
- Review: 2 hours
- Testing: 4 hours
- Deployment: Next business day (minimum)

### Major Changes (Standard Approval)
- Dashboard UI components
- API utility functions
- Reporting features
- Non-critical database changes

**Approval Chain:** Tech Lead → Engineering Lead

**Timeline:**
- Review: 1 hour
- Testing: 2 hours
- Deployment: Same day possible

### Minor Changes (Self-Approval)
- Documentation updates
- Comments/code clarity
- Non-critical bug fixes
- Configuration optimizations

**Approval Chain:** Self-review (must be PR with 1 approval)

**Testing:** Automated tests must pass

---

## 3. Change Request Process

### Step 1: Create Change Request (Jiira Ticket)

```yaml
Title: [CHANGE] Brief description
Type: Change Request

Fields:
  Change Type: Critical / Major / Minor
  Impact Area: Database / API / UI / Security / Infrastructure
  Risk Level: High / Medium / Low
  Affected Systems: [List all]
  Implementation Date: [Date & time]
  Rollback Plan: [Procedure if something goes wrong]
  Approvers: [Names]
  Testing Checklist: [Automated + manual tests]
  Stakeholders: [Who should be notified]

Example:
  Change Type: Critical
  Impact Area: Security
  Implementation Date: 2026-01-16 02:00 UTC (off-peak)
  Rollback Plan: git revert [commit-hash] && npm run deploy-prod
  Testing: [✓] Unit tests pass [✓] Integration tests [✓] Staging deployment
```

### Step 2: Peer Review (Code Level)

**Reviewer Responsibilities:**
1. ✅ Code follows project standards
2. ✅ No hardcoded secrets or credentials
3. ✅ All security best practices applied
4. ✅ Database migrations are reversible
5. ✅ Error handling is comprehensive
6. ✅ Performance impact assessed
7. ✅ Documentation updated

**Review Checklist:**
```javascript
// DO NOT APPROVE if:
- ❌ No error handling
- ❌ Hardcoded environment variables
- ❌ Uncommitted database migration
- ❌ No unit tests for new functions
- ❌ Security implications not documented
- ❌ SQL injection possible
- ❌ Cryptographic algorithm weak

// REQUIRE if:
- 🔒 Security-related: CTO approval mandatory
- 📊 Database: Database admin approval mandatory
- 💰 Payment: Compliance review mandatory
```

### Step 3: Automated Testing

All changes trigger:

```bash
# 1. Linting
npm run lint
# Must pass: No ES Lint errors in modified files

# 2. Unit Tests
npm test
# Must pass: 100% of existing tests still pass

# 3. Security Scanning
npm run security:audit
# Must pass: No critical vulnerabilities introduced

# 4. Build Test
npm run build
# Must succeed: No compilation errors

# 5. Integration Tests (if database changes)
npm run test:integration
# Must pass: Database migrations work correctly
```

**Failure Handling:**
- ❌ Any test failure = automatic PR close, request changes
- Automation re-triggered after fixes
- No exceptions to "green build" requirement

### Step 4: Staging Deployment

After all tests pass:

```bash
# Deploy to staging environment (mirrors production)
npm run deploy:staging

# Monitor for 30 minutes
- Check error logs: https://console.vercel.com/fintrack/logs
- Test critical flows manually
- Check database integrity: SELECT COUNT(*) FROM audit_logs;
- Verify no performance regression
```

**Approval Decision:**

| Scenario | Action | Timeline |
|----------|--------|----------|
| All tests pass + staging looks good | Approve → Schedule prod deploy | 1 hour |
| Performance degrades in staging | Request optimization → Re-test | 24 hours |
| Any error in staging logs | Reject PR → Investigate → Fix | Until resolved |

### Step 5: Production Deployment

**Before Deploying:**
```bash
# 1. Create backup (if database changes)
pg_dump --host=db.supabase.co --format=custom fintrack > backup-pre-deploy.dump

# 2. Prepare rollback command
git log --oneline -1  # Note the current commit hash
echo "Rollback: git revert [HASH] && npm run deploy-prod"

# 3. Notify team
Slack #deployments: "@channel Deploying: [CHANGE] in 5 minutes"

# 4. Deploy during low-traffic window (02:00-04:00 UTC typically)
npm run deploy-prod
```

**Deployment Monitoring (First 1 hour):**

```javascript
// Automated monitoring fires these checks:
- ✅ Health endpoint responds (https://fintrack.app/api/health)
- ✅ Database connectivity: SELECT 1;
- ✅ Authentication still works: Test login/logout
- ✅ Error rate normal: < 0.5% 5xx errors
- ✅ Response times: p95 < 500ms
- ✅ No new error logs in Sentry
- ✅ Slack alerts: Zero security alerts
```

**If Issues Detected (Within 1 Hour):**

```bash
# IMMEDIATE: Rollback
git revert [deploy-commit]
npm run deploy-prod

# Alert team (critical incident protocol)
Slack #security-alerts: "🚨 ROLLBACK: Production deployment reverted due to [error]"

# Investigate
git diff [old-commit] [new-commit] -- src/
# Find what went wrong

# Fix locally
npm test && npm run build && npm run deploy:staging

# Retry after 24 hours (unless critical bug fix)
```

---

## 4. Emergency Changes (Hot Fixes)

**When to Use:** Production outage/security breach requiring immediate fix

**Process (Abbreviated):**
1. ✅ Fix code (skip code review if critical)
2. ✅ Run automated tests locally
3. ✅ Deploy to staging
4. ✅ Test manually (5 min)
5. ✅ Deploy to production
6. ✅ Monitor closely
7. ⏳ Post-mortem within 24 hours with full review

**Requires:** CTO/Engineering Lead approval at time of deployment

**Post-Deployment:** Mandatory peer review within 24 hours (even if already deployed)

---

## 5. Database Migration Process

### Before Migration

```bash
# 1. Test migration in isolation
npm run db:migrate:test

# 2. Estimate impact
SELECT COUNT(*) FROM [table];  # If > 1M rows, inform team

# 3. Create rollback script
-- rollback.sql
DROP TABLE new_table;
ALTER TABLE old_table ... [reverse changes]

# 4. Schedule during maintenance window (midnight UTC)
```

### During Migration

```javascript
// Approach 1: Zero-downtime (Preferred)
- Create new table with new schema
- Copy data in batches (1000 rows at a time)
- Validate: COUNT(*) matches between old and new
- Switch application to read from new table
- Delete old table after 24h validation period

// Approach 2: Brief downtime (If < 1 minute)
- Stop application temporarily
- Run migration: ALTER TABLE schema_change
- Restart application
- Verify data integrity
```

### After Migration

```bash
# 1. Run integrity checks
SELECT * FROM new_table WHERE id NOT IN (SELECT id FROM backup_table);
# Result should be: 0 rows

# 2. Check performance
EXPLAIN ANALYZE SELECT * FROM new_table WHERE user_id = 'user123';
# Should use index, < 100ms execution time

# 3. Monitor error logs
# Check Sentry for: "column not found" or "type mismatch" errors

# 4. Get user confirmation
# Notify stakeholders: "Migration complete, system stable"
```

---

## 6. Configuration Changes

### Application Settings (Credentials, API Keys)

**Process:**
1. Update in Vercel dashboard (Environment Variables)
2. Trigger redeployment automatically
3. **Never** commit to Git
4. **Always** use Vercel Secrets Manager

**For Database Credentials:**
```javascript
// ❌ WRONG - NEVER COMMIT
const API_KEY = 'sk_live_xxx...';  // EXPOSED

// ✅ CORRECT - Use environment variable
const API_KEY = process.env.PADDLE_API_KEY;  // Safe
```

### Feature Flags (Enable/Disable Features)

```javascript
// Example: GDPR controls feature flag
if (process.env.FEATURE_GDPR_CONTROLS === 'true') {
  return <GDPRDataControls />;  // Show component
}
// Allows disabling feature without redeployment
```

**Updating Feature Flags:**
1. Update Vercel environment variable
2. Trigger redeployment
3. Monitor: Feature appears/disappears for 10% of users first (canary deploy)
4. If stable: Roll out to 100%

---

## 7. Change Rollback Procedures

### Quick Rollback (Git Revert)

```bash
# For last deployment
git revert HEAD
npm run deploy-prod

# For specific commit
git revert [commit-hash]
npm run deploy-prod
```

**Time to Rollback:** 5-10 minutes

### Database Rollback (Restore from Backup)

If data corruption detected:

```bash
# 1. Stop application
npm run stop:production

# 2. Restore from pre-migration backup
pg_restore --clean < backup-pre-deploy.dump

# 3. Verify data integrity
SELECT COUNT(*) FROM [tables];

# 4. Restart application
npm run start:production
```

**Time to Rollback:** 1-2 hours (depends on backup size)

---

## 8. Change History & Audit Trail

All changes automatically logged in:

```sql
-- Table: deployment_log
CREATE TABLE deployment_log (
  id BIGSERIAL PRIMARY KEY,
  change_id VARCHAR(20) UNIQUE,     -- Jira ticket: "CH-1234"
  commit_hash VARCHAR(40),          -- Git commit SHA
  deployed_by VARCHAR(100),         -- Engineer name
  deployed_at TIMESTAMP,            -- Deployment time
  environment VARCHAR(20),          -- staging / production
  status VARCHAR(20),               -- success / failed / rolled_back
  description TEXT,                 -- What changed
  impact TEXT,                      -- Systems affected
  approver_1 VARCHAR(100),          -- First approver
  approver_2 VARCHAR(100),          -- Second approver (if critical)
  rollback_executed BOOLEAN,        -- Was it rolled back?
  rollback_time TIMESTAMP,          -- When rolled back
  reason_rollback TEXT              -- Why rolled back (if applicable)
);
```

**Query Examples:**
```sql
-- Who deployed what
SELECT deployed_by, COUNT(*) as changes 
FROM deployment_log 
WHERE deployed_at > NOW() - INTERVAL '30 days'
GROUP BY deployed_by;

-- Failed deployments
SELECT change_id, reason_rollback 
FROM deployment_log 
WHERE status = 'failed' 
ORDER BY deployed_at DESC 
LIMIT 10;

-- Audit trail for specific change
SELECT * FROM deployment_log 
WHERE change_id = 'CH-1234';
```

---

## 9. Roles & Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Engineer** | Create PR, write code, run local tests |
| **Peer Reviewer** | Code review, security check, approve/reject |
| **Tech Lead** | Engineering decision, testing strategy approval |
| **CTO** | Critical changes approval, security oversight |
| **Database Admin** | Migration review, performance impact |
| **DevOps** | Deployment execution, infrastructure changes |

---

## 10. Compliance & Audit

**Auditors see:**
- Every change tracked in Jira
- Every deployment logged in database
- Every approval documented
- Every rollback investigated

**Annual SOC 2 Audit Checklist:**
- ✅ All production deployments approved
- ✅ No unauthorized changes detected
- ✅ Rollback procedures tested
- ✅ All database migrations logged
- ✅ Change history complete (last 12 months)

---

## 11. Checklist for Every Change

**Before Submitting PR:**
- [ ] Code follows project style guide
- [ ] No secrets/credentials in code
- [ ] Unit tests written & passing
- [ ] Local build succeeds (`npm run build`)
- [ ] Documentation updated

**Before Merging to Main:**
- [ ] 1 peer approval (2 if critical)
- [ ] All CI checks pass (lint, tests, security)
- [ ] Staging deployment successful
- [ ] No regressions in staging

**Before Production Deployment:**
- [ ] Change request ticket created & approved
- [ ] Backup created (if database changes)
- [ ] Rollback procedure documented
- [ ] Team notified of deployment time
- [ ] Deployment window: Low traffic period

**After Production Deployment:**
- [ ] Health checks passing
- [ ] Error rates normal
- [ ] No customer complaints (30 min monitoring)
- [ ] Team confirmation: "All systems nominal"

---

## 12. Contact & Escalation

**Normal Questions:** engineering-team@fintrack (email)  
**Urgent Changes:** #engineering-urgent (Slack)  
**Security-Related:** security@fintrack (email + #security-alerts)  
**Database Issues:** db-admin@fintrack (email)  
**Production Outage:** CTO on-call (phone + #incidents Slack channel)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-15 | Initial version - Critical, Major, Minor classifications |
| | | Emergency hotfix process added |
| | | Database migration procedures formalized |
| | | Audit trail logging established |
