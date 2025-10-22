// Environment Configuration
// This file contains environment variables and configuration settings

export const config = {
  // Google Analytics
  GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID || 'G-XXXXXX',
  
  // Store Configuration
  STORE_NAME: process.env.STORE_NAME || 'رحلة _ Rahla',
  CURRENCY: process.env.CURRENCY || 'YER',
  FREE_SHIPPING_THRESHOLD: parseInt(process.env.FREE_SHIPPING_THRESHOLD) || 15000,
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '783387122',
  
  // CDN and API
  CDN_URL: process.env.CDN_URL || 'https://rahlacdn.b-cdn.net',
  API_BASE_URL: process.env.API_BASE_URL || 'https://web-test-d179.onrender.com',
  
  // Development
  DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false,
  
  // Backend Configuration
  BACKEND_PORT: parseInt(process.env.BACKEND_PORT) || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://USER:PASS@CLUSTER/rahla?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'b6e715fb3ca713a51ed9c239d5e5ee75dee0cdbc6f62bd990f0aebc30ffae008d2a5d6853f651d8767dbd9690d8f77409119decf15e59394159d7f15d9a4c424',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://bthwani1.github.io,https://bthwani1.github.io/web-test',
  
  // CDN Configuration
  BUNNY_CDN_API_KEY: process.env.BUNNY_CDN_API_KEY || '8e26303d-9e5c-474e-8a814128ed9e-4658-4664',
  BUNNY_CDN_STORAGE_ZONE: process.env.BUNNY_CDN_STORAGE_ZONE || 'rahlamedia',
  BUNNY_CDN_PULL_ZONE: process.env.BUNNY_CDN_PULL_ZONE || 'rahlacdn',
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN || 'your-sentry-dsn-here',
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || 'your-posthog-key',
  
  // Admin Configuration
  ADMIN_NAME: process.env.ADMIN_NAME || 'Owner',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'owner@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe123',
  
  // Security
  NODE_ENV: process.env.NODE_ENV || 'production'
};

// Helper function to get image URL with CDN
export const getImageUrl = (path, width = 560) => {
  return `${config.CDN_URL}/${path}?width=${width}&quality=70&format=auto&v=1`;
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return config.NODE_ENV === 'development' || config.DEBUG_MODE;
};

// Export default config
export default config;
