// Google Analytics 4 Dynamic Loader
// This script dynamically loads GA4 based on configuration

import { config } from './config.js';

// Function to initialize Google Analytics
export function initializeGA4() {
  const ga4Id = config.GA4_MEASUREMENT_ID;
  
  // Only load GA4 if we have a valid ID and we're not in debug mode
  if (ga4Id && ga4Id !== 'G-XXXXXX' && !config.DEBUG_MODE) {
    // Load the GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ga4Id, {
      page_title: document.title,
      page_location: window.location.href
    });
    
    console.log('Google Analytics 4 initialized with ID:', ga4Id);
  } else {
    console.log('Google Analytics 4 not loaded - invalid ID or debug mode');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGA4);
} else {
  initializeGA4();
}
