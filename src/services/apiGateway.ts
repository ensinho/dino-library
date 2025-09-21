/**
 * API Gateway Service
 * 
 * This service acts as a central hub for communicating with different microservices.
 * It provides:
 * - Service discovery and routing
 * - Error handling and retries
 * - Fallback mechanisms
 * - Request/response logging
 * - Authentication token management
 */

import config from '@/lib/config';

interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  enabled: boolean;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class APIGateway {
  private services: Map<string, ServiceConfig> = new Map();
  private requestId = 0;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize microservices configuration
   * In production, these URLs would come from environment variables or service discovery
   */
  private initializeServices() {
    // Configure each microservice using centralized config
    this.services.set('dinosaur', {
      baseUrl: config.services.dinosaur,
      timeout: 5000,
      retries: 3,
      enabled: config.useLocalServices || config.isProduction
    });

    this.services.set('geological', {
      baseUrl: config.services.geological,
      timeout: 5000,
      retries: 3,
      enabled: config.useLocalServices || config.isProduction
    });

    this.services.set('discovery', {
      baseUrl: config.services.discovery,
      timeout: 5000,
      retries: 3,
      enabled: config.useLocalServices || config.isProduction
    });

    this.services.set('analytics', {
      baseUrl: config.services.analytics,
      timeout: 5000,
      retries: 3,
      enabled: config.useLocalServices || config.isProduction
    });
  }

  /**
   * Call a microservice with automatic retry and error handling
   * @param serviceName - Name of the service to call
   * @param endpoint - API endpoint path
   * @param options - Request options
   * @returns Promise with response data
   */
  async callService(serviceName: string, endpoint: string, options: RequestOptions = {}): Promise<any> {
    const service = this.services.get(serviceName);
    
    if (!service) {
      throw new Error(`Service '${serviceName}' not configured`);
    }

    if (!service.enabled) {
      throw new Error(`Service '${serviceName}' is disabled`);
    }

    const requestId = ++this.requestId;
    const url = `${service.baseUrl}${endpoint}`;
    const timeout = options.timeout || service.timeout;
    const maxRetries = options.retries || service.retries;

    if (config.debugMode || config.isDevelopment) {
    }

    let lastError: Error;

    // Retry logic
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId.toString(),
            ...options.headers,
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (config.debugMode || config.isDevelopment) {
        }
        return data;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Check if a service is available
   * @param serviceName - Name of the service to check
   * @returns Promise<boolean>
   */
  async isServiceHealthy(serviceName: string): Promise<boolean> {
    try {
      await this.callService(serviceName, '/health', { 
        timeout: 2000, 
        retries: 1 
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the health status of all services
   * @returns Promise with service health status
   */
  async getServicesHealth(): Promise<Record<string, boolean>> {
    const services = Array.from(this.services.keys());
    const healthChecks = await Promise.allSettled(
      services.map(service => this.isServiceHealthy(service))
    );

    const health: Record<string, boolean> = {};
    services.forEach((service, index) => {
      const result = healthChecks[index];
      health[service] = result.status === 'fulfilled' ? result.value : false;
    });

    return health;
  }

  /**
   * Enable or disable a service
   * @param serviceName - Name of the service
   * @param enabled - Whether to enable the service
   */
  setServiceEnabled(serviceName: string, enabled: boolean) {
    const service = this.services.get(serviceName);
    if (service) {
      service.enabled = enabled;
      if (config.debugMode || config.isDevelopment) {
      }
    }
  }

  /**
   * Get service configuration
   * @param serviceName - Name of the service
   * @returns Service configuration or undefined
   */
  getServiceConfig(serviceName: string): ServiceConfig | undefined {
    return this.services.get(serviceName);
  }

  /**
   * List all configured services
   * @returns Array of service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }
}

// Create a singleton instance
export const apiGateway = new APIGateway();

// Export for testing and advanced usage
export default apiGateway;