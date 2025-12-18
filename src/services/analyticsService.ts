// Analytics service

export type AnalyticsEventPayload = Record<string, unknown>;

export interface AnalyticsClient {
  trackPageView: (path: string) => void;
  trackEvent: (eventName: string, payload?: AnalyticsEventPayload) => void;
  trackError: (error: Error | string, payload?: AnalyticsEventPayload) => void;

  // Legacy/app convenience methods (used by pages/components)
  track: (eventName: string, payload?: AnalyticsEventPayload) => void;
  trackSearch: (
    query: string,
    resultsCount: number,
    payload?: AnalyticsEventPayload
  ) => void;
  trackFilterUsage: (filterType: string, value: string) => void;
  trackSpeciesView: (speciesId: number, speciesName?: string) => void;
}

class NoopAnalytics implements AnalyticsClient {
  trackPageView(_path: string) {}
  trackEvent(_eventName: string, _payload?: AnalyticsEventPayload) {}
  trackError(_error: Error | string, _payload?: AnalyticsEventPayload) {}

  track(_eventName: string, _payload?: AnalyticsEventPayload) {}
  trackSearch(_query: string, _resultsCount: number, _payload?: AnalyticsEventPayload) {}
  trackFilterUsage(_filterType: string, _value: string) {}
  trackSpeciesView(_speciesId: number, _speciesName?: string) {}
}

const noop = new NoopAnalytics();

export function useAnalytics(): AnalyticsClient {
  return noop;
}
