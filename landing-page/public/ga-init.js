/**
 * Google Analytics 4 Initialization
 * External script to comply with CSP (no 'unsafe-inline')
 * Only loaded when REACT_APP_GA_ID environment variable is set
 */

(function() {
  const gaId = window.__GA_ID__;
  
  if (!gaId || gaId.startsWith('%')) {
    // GA_ID not configured, skip loading
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  function gtag() {
    dataLayer.push(arguments);
  }
  
  gtag('js', new Date());
  gtag('config', gaId);
  
  window.gtag = gtag;

  // Load gtag.js script from Google CDN
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
  document.head.appendChild(script);
})();
