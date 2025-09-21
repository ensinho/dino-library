export interface AppConfig {
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Feature flags
  useLocalServices: boolean;
  enableAnalytics: boolean;
  enableServiceHealthCheck: boolean;
  debugMode: boolean;
  
  // Microservices URLs
  services: {
    dinosaur: string;
    geological: string;
    discovery: string;
    analytics: string;
  };
  
  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // Other settings
  logLevel: string;
}

// Create configuration object
const config: AppConfig = {
  // Environment detection
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // Feature flags with sensible defaults
  useLocalServices: import.meta.env.VITE_USE_LOCAL_SERVICES === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false', // Default to true
  enableServiceHealthCheck: import.meta.env.VITE_ENABLE_SERVICE_HEALTH_CHECK !== 'false',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Microservices URLs
  services: {
    dinosaur: import.meta.env.VITE_DINOSAUR_SERVICE_URL || (import.meta.env.PROD ? '/api/dinosaurs' : 'http://localhost:3001'),
    geological: import.meta.env.VITE_GEOLOGICAL_SERVICE_URL || 'http://localhost:3002',
    discovery: import.meta.env.VITE_DISCOVERY_SERVICE_URL || 'http://localhost:3003',
    analytics: import.meta.env.VITE_ANALYTICS_SERVICE_URL || (import.meta.env.PROD ? '/api/analytics' : 'http://localhost:3004'),
  },
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  
  // Logging
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Validation function
export function validateConfig(): boolean {
  const errors: string[] = [];
  
  // Check required Supabase configuration
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    return false;
  }
  
  return true;
}

// Validate configuration
validateConfig();

export default config;