/**
 * Analytics Service
 * 
 * This service handles user behavior tracking and analytics.
 * It supports:
 * - Event tracking (page views, clicks, searches)
 * - User session management
 * - Performance metrics
 * - A/B testing support
 * - Privacy-compliant data collection
 */

import { apiGateway } from './apiGateway';
import config from '@/lib/config';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: string;
  page?: string;
  userAgent?: string;
  language?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  pageViews: number;
  events: number;
  language: string;
  userAgent: string;
}

export class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: number;

  constructor() {
    // Only initialize if analytics is enabled
    if (!config.enableAnalytics) {
      if (config.debugMode) {
      }
      return;
    }

    this.sessionId = this.getOrCreateSessionId();
    this.initializeSession();
    this.startPeriodicFlush();
    
    // Listen for page unload to flush remaining events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }

    if (config.debugMode) {
    }
  }

  /**
   * Track a generic event
   */
  async track(event: string, properties: Record<string, any> = {}) {
    // Skip if analytics disabled
    if (!config.enableAnalytics) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      language: typeof navigator !== 'undefined' ? navigator.language : undefined
    };

    this.events.push(analyticsEvent);
    
    if (config.debugMode) {
    }

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, properties: Record<string, any> = {}) {
    await this.track('page_view', {
      page,
      title: typeof document !== 'undefined' ? document.title : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...properties
    });

    this.updateSessionActivity();
  }

  /**
   * Track dinosaur species view
   */
  async trackSpeciesView(speciesId: string, speciesName?: string) {
    await this.track('species_view', {
      species_id: speciesId,
      species_name: speciesName
    });
  }

  /**
   * Track search events
   */
  async trackSearch(query: string, resultCount: number, filters?: Record<string, any>) {
    await this.track('search', {
      query,
      result_count: resultCount,
      filters
    });
  }

  /**
   * Track filter usage
   */
  async trackFilterUsage(filterType: string, filterValue: string) {
    await this.track('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue
    });
  }

  /**
   * Track language change
   */
  async trackLanguageChange(fromLanguage: string, toLanguage: string) {
    await this.track('language_change', {
      from_language: fromLanguage,
      to_language: toLanguage
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metric: string, value: number, context?: Record<string, any>) {
    await this.track('performance', {
      metric,
      value,
      context
    });
  }

  /**
   * Track errors
   */
  async trackError(error: Error, context?: Record<string, any>) {
    await this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
    if (config.debugMode) {
    }
  }

  /**
   * Clear user ID (logout)
   */
  clearUserId() {
    this.userId = undefined;
    if (config.debugMode) {
    }
  }

  /**
   * Flush events to analytics service
   */
  async flush() {
    if (this.events.length === 0 || !config.enableAnalytics) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (config.debugMode) {
      }
      
      await apiGateway.callService('analytics', '/events', {
        method: 'POST',
        body: JSON.stringify({ events: eventsToSend })
      });

      if (config.debugMode) {
      }

    } catch (error) {
      // Store events locally for retry
      this.storeEventsLocally(eventsToSend);
    }
  }

  /**
   * Get session information
   */
  getSession(): UserSession {
    const session = localStorage.getItem('analytics_session');
    return session ? JSON.parse(session) : this.createNewSession();
  }

  /**
   * Get analytics insights (for admin dashboard)
   */
  async getInsights(dateRange: { from: string; to: string }) {
    try {
      return await apiGateway.callService('analytics', '/api/insights', {
        method: 'POST',
        body: JSON.stringify(dateRange)
      });
    } catch (error) {
      if (config.debugMode || config.isDevelopment) {
        console.warn('Analytics insights unavailable:', error.message);
      }
      return this.getFallbackInsights();
    }
  }

  /**
   * Check analytics service health
   */
  async isHealthy(): Promise<boolean> {
    try {
      await apiGateway.callService('analytics', '/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Private methods
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private initializeSession() {
    const session = this.getSession();
    session.lastActivity = new Date().toISOString();
    session.language = typeof navigator !== 'undefined' ? navigator.language : 'en';
    localStorage.setItem('analytics_session', JSON.stringify(session));
  }

  private createNewSession(): UserSession {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      events: 0,
      language: typeof navigator !== 'undefined' ? navigator.language : 'en',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };
  }

  private updateSessionActivity() {
    const session = this.getSession();
    session.lastActivity = new Date().toISOString();
    session.pageViews += 1;
    localStorage.setItem('analytics_session', JSON.stringify(session));
  }

  private startPeriodicFlush() {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private storeEventsLocally(events: AnalyticsEvent[]) {
    try {
      const stored = localStorage.getItem('analytics_pending_events');
      const pending = stored ? JSON.parse(stored) : [];
      const updated = [...pending, ...events];
      
      // Keep only last 100 events to avoid storage bloat
      const trimmed = updated.slice(-100);
      localStorage.setItem('analytics_pending_events', JSON.stringify(trimmed));
      
    } catch (error) {
      // Silent fail for local storage
    }
  }

  private getFallbackInsights() {
    // Return basic insights from localStorage
    const session = this.getSession();
    const pendingEvents = localStorage.getItem('analytics_pending_events');
    const events = pendingEvents ? JSON.parse(pendingEvents) : [];

    return {
      session,
      pendingEvents: events.length,
      lastActivity: session.lastActivity,
      totalPageViews: session.pageViews,
      message: 'Analytics service unavailable - showing local data only'
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analyticsService.track.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackSpeciesView: analyticsService.trackSpeciesView.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackFilterUsage: analyticsService.trackFilterUsage.bind(analyticsService),
    trackLanguageChange: analyticsService.trackLanguageChange.bind(analyticsService),
    trackPerformance: analyticsService.trackPerformance.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    setUserId: analyticsService.setUserId.bind(analyticsService),
    clearUserId: analyticsService.clearUserId.bind(analyticsService),
  };
}

export default analyticsService;