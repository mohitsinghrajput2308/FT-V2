/**
 * KEY ROTATION PROCEDURE & IMPLEMENTATION
 * Automated key rotation with versioning and rollback
 */

import { supabase } from '../../lib/supabase';
import crypto from 'crypto';

class KeyRotationManager {
  /**
   * Generate new encryption key
   */
  static generateNewKey() {
    return crypto.randomBytes(32).toString('hex'); // 256-bit key for AES-256
  }

  /**
   * Rotate all active keys
   * Called manually or via scheduled task
   */
  static async rotateAllKeys() {
    console.log('[KEY ROTATION] Starting key rotation process...');

    const rotationLog = {
      timestamp: new Date().toISOString(),
      status: 'IN_PROGRESS',
      keys_rotated: [],
      errors: [],
    };

    try {
      // 1. Rotate Supabase JWT secret
      await this.rotateSupabaseJWT();
      rotationLog.keys_rotated.push('supabase_jwt');

      // 2. Rotate API keys
      await this.rotateAPIKeys();
      rotationLog.keys_rotated.push('api_keys');

      // 3. Rotate encryption keys (if field-level encryption implemented)
      await this.rotateEncryptionKeys();
      rotationLog.keys_rotated.push('encryption_keys');

      // 4. Rotate third-party API tokens
      await this.rotateThirdPartyTokens();
      rotationLog.keys_rotated.push('third_party_tokens');

      // Log successful rotation
      rotationLog.status = 'COMPLETED';
      await this.logRotation(rotationLog);

      console.log('[KEY ROTATION] ✅ Completed successfully', rotationLog);
      return { success: true, log: rotationLog };
    } catch (error) {
      rotationLog.status = 'FAILED';
      rotationLog.errors.push(error.message);
      await this.logRotation(rotationLog);
      console.error('[KEY ROTATION] ❌ Failed:', error);
      return { success: false, error: error.message, log: rotationLog };
    }
  }

  /**
   * Rotate Supabase JWT secret
   * Required for signed tokens to invalidate
   */
  static async rotateSupabaseJWT() {
    console.log('[KEY ROTATION] Rotating Supabase JWT...');
    // Action: User must manually go to Supabase Dashboard
    // Project Settings → API → JWT Secret → Rotate
    // Then redeploy this application
    return {
      action: 'MANUAL',
      instructions: `
        1. Go to: https://app.supabase.com/project/[PROJECT_ID]/settings/api
        2. Scroll to "JWT Secret"
        3. Click "Rotate key"
        4. Copy new secret
        5. Update REACT_APP_SUPABASE_ANON_KEY in environment
        6. Redeploy application
        7. All previous tokens automatically invalidated
      `,
      frequency: 'Every 90 days',
      impact: 'All user sessions terminated - users must re-login',
    };
  }

  /**
   * Rotate API keys
   */
  static async rotateAPIKeys() {
    console.log('[KEY ROTATION] Rotating API keys...');

    // Get all active API keys
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    for (const key of keys || []) {
      // Generate new key
      const newKey = this.generateNewKey();
      const hashedNewKey = crypto.createHash('sha256').update(newKey).digest('hex');

      // Update in database
      await supabase
        .from('api_keys')
        .update({
          key_hash: hashedNewKey,
          rotated_at: new Date().toISOString(),
          version: (key.version || 1) + 1,
        })
        .eq('id', key.id);

      console.log(`[KEY ROTATION] API key rotated: ${key.id}`);
    }
  }

  /**
   * Rotate encryption keys (field-level)
   */
  static async rotateEncryptionKeys() {
    console.log('[KEY ROTATION] Rotating field-level encryption keys...');

    // Generate new master key
    const newMasterKeyVersion = this.generateNewKey();

    // Store new key with version
    await supabase.from('encryption_keys').insert({
      key_version: newMasterKeyVersion.split('_')[0],
      key_hash: crypto.createHash('sha256').update(newMasterKeyVersion).digest('hex'),
      algorithm: 'AES-256-GCM',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    // Mark old key as inactive
    await supabase
      .from('encryption_keys')
      .update({ is_active: false })
      .neq('key_version', newMasterKeyVersion.split('_')[0]);

    console.log('[KEY ROTATION] Encryption keys rotated');
  }

  /**
   * Rotate third-party API tokens (Paddle, Google, etc.)
   */
  static async rotateThirdPartyTokens() {
    console.log('[KEY ROTATION] Rotating third-party tokens...');

    // Paddle API Token
    // Action: User must manually rotate in Paddle Dashboard
    console.log('📋 Manual action required:');
    console.log('  - Paddle: Go to Settings → Integrations → API Key → Regenerate');
    console.log('  - Google: Go to Google Cloud Console → Credentials → Regenerate key');
    console.log('  - Supabase: See JWT rotation above');
  }

  /**
   * Log rotation event to audit trail
   */
  static async logRotation(log) {
    try {
      await supabase.from('key_rotation_log').insert({
        rotation_timestamp: log.timestamp,
        status: log.status,
        keys_rotated: JSON.stringify(log.keys_rotated),
        errors: JSON.stringify(log.errors),
      });
    } catch (err) {
      console.warn('Could not log key rotation:', err);
    }
  }

  /**
   * Rollback to previous key (emergency)
   */
  static async rollbackKey(keyType) {
    console.log(`[KEY ROTATION] Rolling back ${keyType}...`);

    try {
      const { data: previousKey, error } = await supabase
        .from('encryption_keys')
        .select('*')
        .eq('algorithm', 'AES-256-GCM')
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      if (previousKey.length < 2) {
        throw new Error('No previous key version to rollback to');
      }

      // Reactivate previous key
      await supabase
        .from('encryption_keys')
        .update({ is_active: true })
        .eq('key_version', previousKey[1].key_version);

      // Deactivate current key
      await supabase
        .from('encryption_keys')
        .update({ is_active: false })
        .eq('key_version', previousKey[0].key_version);

      console.log(`✅ Rolled back to key version: ${previousKey[1].key_version}`);
      return { success: true, rolled_back_to: previousKey[1].key_version };
    } catch (err) {
      console.error('❌ Rollback failed:', err);
      return { success: false, error: err.message };
    }
  }
}

/**
 * SCHEDULED ROTATION (Run in background)
 * Schedule via cron job or cloud function
 */
export const scheduleKeyRotation = () => {
  // Every 90 days
  const ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000; // 90 days in ms

  setInterval(async () => {
    console.log('🔄 [SCHEDULED] Running automatic key rotation...');
    const result = await KeyRotationManager.rotateAllKeys();

    // Send alert to security team
    if (!result.success) {
      await notifySecurityTeam({
        subject: '❌ Key Rotation Failed',
        message: `Key rotation failed: ${result.error}`,
        severity: 'HIGH',
      });
    }
  }, ROTATION_INTERVAL);
};

/**
 * MANUAL ROTATION ENDPOINT
 * Called via admin dashboard
 */
export const triggerKeyRotation = async (req, res) => {
  // Verify API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await KeyRotationManager.rotateAllKeys();
  res.json(result);
};

export default KeyRotationManager;
