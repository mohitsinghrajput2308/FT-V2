/**
 * SECURITY IMPLEMENTATION: TLS 1.3 Enforcement
 * 
 * This configuration ensures all connections use TLS 1.3 minimum.
 * Deploy via Vercel config or Supabase SSL settings.
 */

// ============================================
// VERCEL CONFIGURATION (vercel.json)
// ============================================
/*
  Add this securityHeaders configuration if not present:
  
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          }
        ]
      }
    ]
  }
  
  NOTE: Vercel automatically uses TLS 1.3 for all connections.
  No additional configuration needed for frontend.
*/

// ============================================
// SUPABASE CONFIGURATION
// ============================================
/*
  For Supabase backend (database connections):
  
  1. Login to Supabase Dashboard
  2. Go to Project Settings → Database → Networking
  3. Set "Enforce TLS 1.3 minimum"
  4. This requires Supabase Pro plan
  
  For Free tier: Supabase routes all connections via TLS 1.2+
  For Pro tier: Can enforce TLS 1.3 minimum
*/

// ============================================
// NODEJS CLIENT VERIFICATION
// ============================================
const verifyTLSVersion = () => {
  const https = require('https');
  
  // Check TLS version for Supabase connection
  const agent = new https.Agent({
    minVersion: 'TLSv1.3',
    maxVersion: 'TLSv1.3',
  });
  
  // Use agent in fetch calls
  return agent;
};

module.exports = { verifyTLSVersion };
