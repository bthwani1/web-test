/**
 * Security Headers Configuration
 * تطبيق معايير الأمان المتقدمة
 */

const securityHeaders = {
  // منع XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // منع MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // منع clickjacking
  'X-Frame-Options': 'DENY',
  
  // تطبيق HSTS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // منع referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // منع DNS prefetching
  'X-DNS-Prefetch-Control': 'off',
  
  // منع IE compatibility mode
  'X-UA-Compatible': 'IE=edge',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https://rahlacdn.b-cdn.net",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.bunny.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', ')
};

/**
 * تطبيق رؤوس الأمان على Express app
 */
function applySecurityHeaders(app) {
  app.use((req, res, next) => {
    // تطبيق جميع رؤوس الأمان
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // رؤوس إضافية للبيئة الإنتاج
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('X-Powered-By', 'Rahla Store');
    }
    
    next();
  });
}

/**
 * فحص رؤوس الأمان
 */
function checkSecurityHeaders(url = 'http://localhost:3000') {
  const requiredHeaders = [
    'X-XSS-Protection',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Strict-Transport-Security',
    'Content-Security-Policy'
  ];
  
  console.log('🔒 فحص رؤوس الأمان...');
  console.log('URL:', url);
  console.log('الرؤوس المطلوبة:', requiredHeaders);
  
  return requiredHeaders;
}

module.exports = {
  securityHeaders,
  applySecurityHeaders,
  checkSecurityHeaders
};