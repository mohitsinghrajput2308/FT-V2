/**
 * BREACH NOTIFICATION SYSTEM
 * Automated 72-hour GDPR breach notification & alert system
 * 
 * Triggers on:
 * - Unauthorized data access detected
 * - Security incident confirmed
 * - Data leak reported
 */

import nodemailer from 'nodemailer';
import { supabase } from '../../lib/supabase';

class BreachNotificationSystem {
  /**
   * Initialize email transporter (SendGrid)
   */
  static getEmailTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  /**
   * Handle security incident
   * Called when breach is detected
   */
  static async handleSecurityIncident(incident) {
    console.log('[BREACH NOTIFICATION] Processing incident:', incident);

    const breachRecord = {
      incident_id: incident.id,
      incident_type: incident.type, // 'unauthorized_access', 'data_leak', etc.
      severity: incident.severity, // 'low', 'medium', 'high', 'critical'
      affected_users: incident.affected_user_ids?.length || 0,
      description: incident.description,
      discovered_at: new Date().toISOString(),
      notification_status: 'PENDING',
    };

    try {
      // Step 1: Log incident to audit trail
      await supabase.from('security_incidents').insert(breachRecord);

      // Step 2: Determine if breach notification required (high risk)
      const requiresNotification = this.evaluateRisk(incident);

      if (requiresNotification) {
        // Step 3: Internal notification (immediate - 1 hour)
        await this.notifyInternalTeam(incident);

        // Step 4: Schedule external notifications (72 hours)
        await this.scheduleExternalNotifications(incident);

        // Step 5: Log to audit trail
        breachRecord.notification_status = 'PENDING_72H';
      } else {
        breachRecord.notification_status = 'NO_NOTIFICATION_REQUIRED';
      }

      await supabase
        .from('security_incidents')
        .update(breachRecord)
        .eq('incident_id', incident.id);

      return { success: true, notificationRequired: requiresNotification };
    } catch (error) {
      console.error('[BREACH NOTIFICATION] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Evaluate if notification is required
   * GDPR Art 33: Notify if "high risk to rights and freedoms"
   */
  static evaluateRisk(incident) {
    // High risk factors:
    const hasHighRisk =
      incident.severity === 'critical' ||
      incident.severity === 'high' ||
      incident.affected_user_ids?.length > 100 ||
      incident.data_types?.includes('financial_records') ||
      incident.data_types?.includes('personal_identification');

    return hasHighRisk;
  }

  /**
   * Notify internal incident response team (immediate)
   */
  static async notifyInternalTeam(incident) {
    console.log('[BREACH NOTIFICATION] Notifying internal team...');

    const transporter = this.getEmailTransporter();

    const emailContent = `
🚨 SECURITY INCIDENT ALERT 🚨

Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity}
Affected Users: ${incident.affected_user_ids?.length || 0}
Discovered: ${new Date().toISOString()}

Description:
${incident.description}

REQUIRED ACTIONS:
1. ✅ Confirm incident details
2. ✅ Determine breach vs misuse
3. ✅ Identify root cause
4. ✅ Prepare customer notification (if required)
5. ✅ Notify Supervisory Authority within 72 hours

Timeline:
- NOW: Internal notification
- +24h: Root cause must be identified
- +48h: Notification plan ready
- +72h: External notifications sent (if high-risk)

Incident Status: https://internal.fintrack.app/security/incidents/${incident.id}
    `;

    // Send to security team + leadership
    await transporter.sendMail({
      from: 'security@fintrack.app',
      to: [
        'security@fintrack.app',
        'compliance@fintrack.app',
        process.env.CEO_EMAIL,
      ],
      subject: `🚨 SECURITY INCIDENT: ${incident.type} (${incident.severity})`,
      text: emailContent,
      priority: 'high',
    });

    console.log('✅ Internal team notified');
  }

  /**
   * Schedule external notifications (72 hours)
   */
  static async scheduleExternalNotifications(incident) {
    console.log('[BREACH NOTIFICATION] Scheduling external notifications...');

    // Schedule notifications for 72 hours from now
    const notificationTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // Store scheduled notification
    await supabase.from('breach_notifications').insert({
      incident_id: incident.id,
      scheduled_at: notificationTime.toISOString(),
      status: 'SCHEDULED',
      user_ids: incident.affected_user_ids,
      notification_type: 'GDPR_BREACH_NOTIFICATION',
    });

    // Set up background job to send at scheduled time
    setTimeout(
      async () => {
        await this.sendExternalNotifications(incident);
      },
      72 * 60 * 60 * 1000 // 72 hours
    );

    console.log(`✅ External notifications scheduled for: ${notificationTime}`);
  }

  /**
   * Send actual external breach notifications to users
   */
  static async sendExternalNotifications(incident) {
    console.log('[BREACH NOTIFICATION] Sending external notifications to users...');

    const transporter = this.getEmailTransporter();

    // Get affected users
    const { data: affectedUsers, error } = await supabase
      .from('profiles')
      .select('email')
      .in('user_id', incident.affected_user_ids);

    if (error) throw error;

    for (const user of affectedUsers || []) {
      const breachNotificationEmail = `
Dear User,

We are writing to notify you of a security incident affecting your FinTrack account.

INCIDENT DETAILS
================
Date Discovered: ${incident.discovered_at}
Type: ${incident.type}
Severity: ${incident.severity}

DATA POTENTIALLY AFFECTED
==========================
${incident.data_types?.join('\n')}

INFORMATION WE HAVE CONFIRMED WAS NOT COMPROMISED
==================================================
❌ Your password (stored as one-way hash - cannot be decrypted)
❌ Your 2FA codes (only stored temporarily)
❌ Your full financial transaction history (encrypted separately)

ACTIONS WE HAVE TAKEN
====================
✅ Contained the incident
✅ Fixed the underlying vulnerability
✅ Enhanced monitoring
✅ Preserved all forensic evidence for investigation

WHAT YOU SHOULD DO
==================
1. Change your password immediately: https://fintrack.app/settings/security
2. Enable 2FA if not already enabled
3. Monitor your account for unusual activity
4. Contact support with any questions

YOUR RIGHTS
===========
- Right to access: Request all data we hold about you
- Right to deletion: Request data deletion (subject to retention policies)
- Right to complaint: File complaint with data protection authority in your country

CONTACT US
==========
Security Team: security@fintrack.app
Data Protection Officer: dpo@fintrack.app
Response: Within 48 hours

We take data protection seriously. Thank you for your continued trust.

Best regards,
FinTrack Security Team
      `;

      await transporter.sendMail({
        from: 'security@fintrack.app',
        to: user.email,
        subject: `Important Security Notice - FinTrack Account ${incident.id}`,
        text: breachNotificationEmail,
        priority: 'high',
      });

      console.log(`✅ Notification sent to: ${user.email}`);
    }

    // Update status
    await supabase
      .from('breach_notifications')
      .update({ status: 'SENT', sent_at: new Date().toISOString() })
      .eq('incident_id', incident.id);

    // Notify Supervisory Authority (formal letter)
    await this.notifySupervisoryAuthority(incident);
  }

  /**
   * Notify Supervisory Authority (GDPR Art 33)
   */
  static async notifySupervisoryAuthority(incident) {
    console.log('[BREACH NOTIFICATION] Preparing Supervisory Authority notification...');

    const letter = `
FORMAL DATA BREACH NOTIFICATION
For: [SUPERVISORY AUTHORITY - e.g., GDPR Supervisor]
Date: ${new Date().toISOString()}

FinTrack Inc.
Data Protection Officer: dpo@fintrack.app

BREACH DETAILS
==============
Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity}
Affected Data Subjects: ${incident.affected_user_ids?.length || 0}
Data Categories: ${incident.data_types?.join(', ')}
Date Discovered: ${incident.discovered_at}

TIMELINE
========
- Discovered: ${incident.discovered_at}
- Internal Team Notified: T+1 hour
- Individuals Notified: T+72 hours
- Authority Notification: T+72 hours (this email)

MEASURES TAKEN
==============
✅ Incident contained and isolated
✅ Root cause identified and fixed
✅ System hardened
✅ Affected individuals notified
✅ Forensic evidence preserved

We stand ready to cooperate with any investigation.
    `;

    // Store for manual handling (each country has different authority)
    await supabase.from('authority_notifications').insert({
      incident_id: incident.id,
      letter_content: letter,
      status: 'PENDING_MANUAL_SEND',
      created_at: new Date().toISOString(),
    });

    console.log('ℹ️ Supervisory Authority notification prepared (manual send required)');
  }

  /**
   * API Endpoint for incident reporting
   */
  static createIncidentEndpoint() {
    return async (req, res) => {
      const { type, severity, description, affected_user_ids, data_types } = req.body;

      // Verify authorization
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        const result = await this.handleSecurityIncident({
          id: `INC-${Date.now()}`,
          type,
          severity,
          description,
          affected_user_ids,
          data_types,
          discovered_at: new Date().toISOString(),
        });

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }
}

export default BreachNotificationSystem;
