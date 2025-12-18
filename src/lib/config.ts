export interface AppConfig {
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Feature flags
  useLocalServices: boolean;
  enableAnalytics: boolean;
  enableServiceHealthCheck: boolean;
  debugMode: boolean;
  
  
  // Firebase configuration (primary backend)
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    storageBucket?: string;
    messagingSenderId?: string;
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
  
  
  // Firebase configuration (primary backend)
  firebase:
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
      ? {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        }
      : undefined,
  
  // Logging
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Validation function
export function validateConfig(): boolean {
  const errors: string[] = [];
  
  // Check required Firebase configuration
  if (!config.firebase?.apiKey) errors.push('VITE_FIREBASE_API_KEY is required');
  if (!config.firebase?.authDomain) errors.push('VITE_FIREBASE_AUTH_DOMAIN is required');
  if (!config.firebase?.projectId) errors.push('VITE_FIREBASE_PROJECT_ID is required');
  if (!config.firebase?.appId) errors.push('VITE_FIREBASE_APP_ID is required');
  
  if (errors.length > 0) {
    return false;
  }
  
  return true;
}

// Validate configuration
validateConfig();

export default config;