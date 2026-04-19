/**
 * GDPR Data Subject Rights - Restrict & Object Processing
 * 
 * Implements Article 18 (Right to Restrict) and Article 21 (Right to Object)
 * Users can opt into these controls via Settings
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const GDPRDataControls = ({ userId }) => {
  const [restrictions, setRestrictions] = useState({
    restrict_processing: false,      // Article 18 - Pause all processing
    restrict_analytics: false,        // Article 21 - Opt-out of analytics
    restrict_marketing: false,        // Article 21 - No marketing emails
    restrict_profiling: false,        // Article 22 - No automated decisions
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load user's current restrictions
  useEffect(() => {
    loadRestrictions();
  }, [userId]);

  const loadRestrictions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('gdpr_restrictions')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data?.gdpr_restrictions) {
        setRestrictions(data.gdpr_restrictions);
      }
    } catch (err) {
      console.error('Error loading restrictions:', err);
    }
  };

  const updateRestrictions = async (newRestrictions) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          gdpr_restrictions: newRestrictions,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      setRestrictions(newRestrictions);
      setMessage({
        type: 'success',
        text: '✓ Your privacy settings have been updated',
      });

      // Log action in audit trail
      await logGDPRAction(userId, 'processing_restriction_updated', newRestrictions);

      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Error updating restrictions:', err);
      setMessage({
        type: 'error',
        text: 'Failed to update settings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    const newRestrictions = { ...restrictions, [key]: !restrictions[key] };
    updateRestrictions(newRestrictions);
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          🛡️ Data Processing Controls (GDPR)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          You have the right to restrict or object to certain types of data processing. 
          Changes take effect immediately.
        </p>
      </div>

      {/* Restrict All Processing (Article 18) */}
      <div className="border-l-4 border-amber-500 pl-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              ⏸️ Right to Restrict Processing (Article 18)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When enabled: Your account is frozen. No data processing occurs except storage. 
              This pauses financial features but preserves your data.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              ⚠️ <strongWarning</strong>: Dashboard will be read-only mode only.
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={restrictions.restrict_processing}
              onChange={() => handleToggle('restrict_processing')}
              disabled={loading}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Object to Analytics (Article 21) */}
      <div className="border-l-4 border-blue-500 pl-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              📊 Right to Object to Analytics (Article 21)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When enabled: No analytics tracking, Google Analytics disabled, 
              Crisp chat disabled. FinTrack only sees that you're using the app (aggregated).
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={restrictions.restrict_analytics}
              onChange={() => handleToggle('restrict_analytics')}
              disabled={loading}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Object to Marketing (Article 21) */}
      <div className="border-l-4 border-green-500 pl-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              📧 Right to Object to Marketing (Article 21)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When enabled: No marketing emails, no promotional communications. 
              You'll only receive transactional emails (password resets, security alerts).
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={restrictions.restrict_marketing}
              onChange={() => handleToggle('restrict_marketing')}
              disabled={loading}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Object to Profiling (Article 22) */}
      <div className="border-l-4 border-purple-500 pl-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              🤖 Right to Object to Automated Decision-Making (Article 22)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When enabled: No automated profiling or AI-based decisions about you. 
              All decisions are human-reviewed (e.g., fraud detection, subscription changes).
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={restrictions.restrict_profiling}
              onChange={() => handleToggle('restrict_profiling')}
              disabled={loading}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current Status Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            {restrictions.restrict_processing ? '✅' : '⭕'} Restrict Processing:{' '}
            <span className={restrictions.restrict_processing ? 'text-amber-600' : 'text-gray-600'}>
              {restrictions.restrict_processing ? 'ENABLED' : 'Disabled'}
            </span>
          </li>
          <li>
            {restrictions.restrict_analytics ? '✅' : '⭕'} Analytics Opt-Out:{' '}
            <span className={restrictions.restrict_analytics ? 'text-blue-600' : 'text-gray-600'}>
              {restrictions.restrict_analytics ? 'ENABLED' : 'Disabled'}
            </span>
          </li>
          <li>
            {restrictions.restrict_marketing ? '✅' : '⭕'} Marketing Opt-Out:{' '}
            <span className={restrictions.restrict_marketing ? 'text-green-600' : 'text-gray-600'}>
              {restrictions.restrict_marketing ? 'ENABLED' : 'Disabled'}
            </span>
          </li>
          <li>
            {restrictions.restrict_profiling ? '✅' : '⭕'} No Automated Decisions:{' '}
            <span className={restrictions.restrict_profiling ? 'text-purple-600' : 'text-gray-600'}>
              {restrictions.restrict_profiling ? 'ENABLED' : 'Disabled'}
            </span>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: You can enable/disable these controls anytime from Settings. No penalties.
      </p>
    </div>
  );
};

/**
 * Log GDPR action to audit trail
 */
async function logGDPRAction(userId, action, details) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: `GDPR_${action}`,
      table_name: 'user_settings',
      old_data: null,
      new_data: details,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not log GDPR action:', err);
  }
}

export default GDPRDataControls;
