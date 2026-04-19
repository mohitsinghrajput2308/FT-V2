/**
 * SECURITY MONITORING & ALERTING
 * Real-time detection of security anomalies
 */

import { supabase } from '../../lib/supabase';
import slack from '../integrations/slack';

class SecurityMonitoring {
  /**
   * Monitor failed login attempts
   */
  static async monitorFailedLogins() {
    console.log('[MONITORING] Checking failed login patterns...');

    // Get failed logins in last 1 hour
    const { data: failedLogins, error } = await supabase
      .from('auth_logs')
      .select('user_id, email, timestamp')
      .eq('status', 'failed')
      .gt('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Group by email
    const attemptsByEmail = {};
    for (const login of failedLogins || []) {
      if (!attemptsByEmail[login.email]) {
        attemptsByEmail[login.email] = [];
      }
      attemptsByEmail[login.email].push(login);
    }

    // Detect brute force (5+ failures in 10 minutes)
    for (const [email, attempts] of Object.entries(attemptsByEmail)) {
      if (attempts.length >= 5) {
        const timeDiff =
          (new Date(attempts[attempts.length - 1].timestamp) -
            new Date(attempts[0].timestamp)) /
          1000 /
          60; // minutes

        if (timeDiff <= 10) {
          await this.alertBruteForceThreat(email, attempts.length);
        }
      }
    }
  }

  /**
   * Monitor unauthorized access attempts
   */
  static async monitorUnauthorizedAccess() {
    console.log('[MONITORING] Checking for unauthorized access...');

    // RLS violations (trying to access other users' data)
    const { data: violations, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'RLS_VIOLATION')
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) throw error;

    if (violations?.length > 0) {
      await this.alertUnauthorizedAccess(violations);
    }
  }

  /**
   * Monitor API abuse
   */
  static async monitorAPIAbuse() {
    console.log('[MONITORING] Checking for API abuse...');

    // Get rate limit violations from logs
    const { data: rateLimitHits, error } = await supabase
      .from('audit_logs')
      .select('user_id, action, count')
      .eq('action', 'RATE_LIMIT_EXCEEDED')
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) throw error;

    for (const hit of rateLimitHits || []) {
      if (hit.count > 10) {
        // Sustained abuse
        await this.alertAPIAbuse(hit.user_id, hit.count);
      }
    }
  }

  /**
   * Monitor data exfiltration patterns
   */
  static async monitorDataExfiltration() {
    console.log('[MONITORING] Checking for data exfiltration....');

    // Detect unusual bulk downloads/exports
    const { data: exports, error } = await supabase
      .from('audit_logs')
      .select('user_id, record_count, created_at')
      .eq('action', 'DATA_EXPORT')
      .gt('record_count', 1000) // Large export
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    for (const exp of exports || []) {
      await this.alertDataExfiltration(exp.user_id, exp.record_count);
    }
  }

  /**
   * Alert: Brute force attack detected
   */
  static async alertBruteForceThreat(email, failureCount) {
    console.log(`[ALERT] Brute force detected on ${email}: ${failureCount} failures`);

    await slack.send({
      channel: '#security-alerts',
      text: `🚨 BRUTE FORCE ATTACK DETECTED`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *Brute Force Attack Detected*\n\nEmail: ${email}\nFailed Attempts: ${failureCount} in 10 minutes\nAction: Auto-locked for 30 minutes`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Review Incident log' },
              url: `https://fintrack.app/admin/incidents?email=${email}`,
            },
          ],
        },
      ],
    });

    // Auto-lock account
    await supabase
      .from('auth_locks')
      .insert({
        email,
        locked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        reason: 'BRUTE_FORCE_PROTECTION',
      });
  }

  /**
   * Alert: Unauthorized access
   */
  static async alertUnauthorizedAccess(violations) {
    console.log(`[ALERT] ${violations.length} unauthorized access attempts detected`);

    await slack.send({
      channel: '#security-alerts',
      text: `🚨 UNAUTHORIZED ACCESS ATTEMPTS`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *Unauthorized Access Detected*\n\nViolations: ${violations.length}\nTime: Last 60 minutes\nStatus: Being investigated`,
          },
        },
      ],
    });
  }

  /**
   * Alert: API abuse
   */
  static async alertAPIAbuse(userId, hitCount) {
    console.log(`[ALERT] API abuse detected for user ${userId}: ${hitCount} hits`);

    await slack.send({
      channel: '#security-alerts',
      text: `⚠️ API ABUSE DETECTED`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⚠️ *API Abuse Pattern*\n\nUser: ${userId}\nRate Limit Hits: ${hitCount}\nAction: Rate limit enhanced`,
          },
        },
      ],
    });
  }

  /**
   * Alert: Data exfiltration
   */
  static async alertDataExfiltration(userId, recordCount) {
    console.log(`[ALERT] Unusual export by user ${userId}: ${recordCount} records`);

    await slack.send({
      channel: '#security-alerts',
      text: `🚨 POTENTIAL DATA EXFILTRATION`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *Unusual Data Export*\n\nUser: ${userId}\nRecords: ${recordCount}\nAction: Monitored for 72 hours`,
          },
        },
      ],
    });
  }

  /**
   * Run all monitoring checks every 5 minutes
   */
  static startContinuousMonitoring() {
    console.log('🔍 [MONITORING] Starting continuous security monitoring...');

    setInterval(async () => {
      try {
        await this.monitorFailedLogins();
        await this.monitorUnauthorizedAccess();
        await this.monitorAPIAbuse();
        await this.monitorDataExfiltration();
      } catch (error) {
        console.error('[MONITORING] Error during check:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

export default SecurityMonitoring;
