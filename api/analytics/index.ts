// Analytics Service - Serverless Function for Vercel

// Types
interface AnalyticsEvent {
  event: string;
  timestamp: string;
  sessionId?: string;
  userId?: string;
  properties?: Record<string, any>;
  page?: string;
  language?: string;
  receivedAt?: string;
  serverId?: string;
  processed?: boolean;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  eventCount: number;
  events: Array<{
    event: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Utility function to respond with JSON
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// In-memory storage for serverless (in production, use external storage)
let analyticsEvents: AnalyticsEvent[] = [];
let activeSessions = new Map<string, UserSession>();

// Main handler function
export default async function handler(request: Request) {
  const url = new URL(request.url);
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Health check endpoint
    if (url.pathname.endsWith('/health')) {
      return jsonResponse({
        status: 'healthy',
        service: 'analytics-service-vercel',
        timestamp: new Date().toISOString(),
        runtime: 'nodejs',
        stats: {
          eventsInMemory: analyticsEvents.length,
          activeSessions: activeSessions.size,
          totalEventsReceived: analyticsEvents.length
        }
      });
    }

    // Receive and process analytics events
    if (method === 'POST' && url.pathname.endsWith('/events')) {
      const body = await request.json().catch(() => ({}));
      const { events } = body;
      
      if (!Array.isArray(events)) {
        return jsonResponse({ 
          error: 'Invalid request format',
          expected: 'Array of events' 
        }, 400);
      }

      console.log(`📊 Vercel Analytics Service: Received ${events.length} events`);
      
      const processedEvents: AnalyticsEvent[] = [];
      
      // Process each event
      events.forEach((event: AnalyticsEvent) => {
        // Validate event structure
        if (!event.event || !event.timestamp) {
          console.warn('⚠️ Invalid event structure:', event);
          return;
        }

        // Enrich event with server-side data
        const enrichedEvent: AnalyticsEvent = {
          ...event,
          receivedAt: new Date().toISOString(),
          serverId: 'analytics-service-vercel',
          processed: true
        };

        processedEvents.push(enrichedEvent);
        analyticsEvents.push(enrichedEvent);

        // Update session tracking
        if (event.sessionId) {
          const session = activeSessions.get(event.sessionId) || {
            sessionId: event.sessionId,
            userId: event.userId,
            startTime: event.timestamp,
            lastActivity: event.timestamp,
            eventCount: 0,
            events: []
          };

          session.lastActivity = event.timestamp;
          session.eventCount += 1;
          session.events.push({
            event: event.event,
            timestamp: event.timestamp,
            properties: event.properties
          });

          // Keep only last 50 events per session to manage memory
          if (session.events.length > 50) {
            session.events = session.events.slice(-50);
          }

          activeSessions.set(event.sessionId, session);
        }
      });

      console.log(`✅ Vercel Analytics Service: Processed ${processedEvents.length} events. Total: ${analyticsEvents.length}`);

      return jsonResponse({ 
        success: true, 
        received: events.length,
        processed: processedEvents.length,
        totalStored: analyticsEvents.length 
      });
    }

    // Generate insights from analytics data
    if (method === 'POST' && url.pathname.endsWith('/insights')) {
      const body = await request.json().catch(() => ({}));
      const { from, to } = body;
      
      console.log(`📊 Vercel Analytics Service: Generating insights for period ${from} to ${to}`);
      
      // Filter events by date range
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      const filteredEvents = analyticsEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= fromDate && eventDate <= toDate;
      });

      console.log(`📊 Found ${filteredEvents.length} events in date range`);

      // Calculate comprehensive insights
      const insights = {
        summary: {
          totalEvents: filteredEvents.length,
          uniqueSessions: new Set(filteredEvents.map(e => e.sessionId)).size,
          dateRange: { from, to },
          generatedAt: new Date().toISOString()
        },
        events: {
          pageViews: filteredEvents.filter(e => e.event === 'page_view').length,
          catalogSearches: filteredEvents.filter(e => e.event === 'catalog_search').length,
          speciesViews: filteredEvents.filter(e => e.event === 'species_view').length,
          languageChanges: filteredEvents.filter(e => e.event === 'language_change').length,
          filterApplied: filteredEvents.filter(e => e.event === 'catalog_filter_applied').length,
          dinosaurClicks: filteredEvents.filter(e => e.event === 'dinosaur_clicked').length,
          errors: filteredEvents.filter(e => e.event === 'error').length
        },
        topPages: {} as Record<string, number>,
        topSearches: {} as Record<string, number>,
        topSpecies: {} as Record<string, number>,
        languages: {} as Record<string, number>,
        performance: {
          averageLoadTime: 0,
          slowQueries: [] as Array<{
            timestamp: string;
            loadTime: number;
            searchTerm?: string;
            resultCount?: number;
          }>
        }
      };

      // Analyze page views
      filteredEvents
        .filter(e => e.event === 'page_view')
        .forEach(e => {
          const page = e.properties?.page || e.page || 'unknown';
          insights.topPages[page] = (insights.topPages[page] || 0) + 1;
        });

      // Analyze searches
      filteredEvents
        .filter(e => e.event === 'catalog_search')
        .forEach(e => {
          const query = e.properties?.search_term;
          if (query && query.trim()) {
            insights.topSearches[query] = (insights.topSearches[query] || 0) + 1;
          }
        });

      // Analyze species views
      filteredEvents
        .filter(e => e.event === 'dinosaur_clicked')
        .forEach(e => {
          const species = e.properties?.dinosaur_name;
          if (species) {
            insights.topSpecies[species] = (insights.topSpecies[species] || 0) + 1;
          }
        });

      // Analyze languages
      filteredEvents.forEach(e => {
        const language = e.language || 'unknown';
        insights.languages[language] = (insights.languages[language] || 0) + 1;
      });

      // Analyze performance
      const performanceEvents = filteredEvents.filter(e => 
        e.event === 'catalog_search' && e.properties?.load_time_ms
      );
      
      if (performanceEvents.length > 0) {
        const totalTime = performanceEvents.reduce((sum, e) => 
          sum + (e.properties?.load_time_ms || 0), 0
        );
        insights.performance.averageLoadTime = Math.round(totalTime / performanceEvents.length);
        
        // Find slow queries (> 2 seconds)
        insights.performance.slowQueries = performanceEvents
          .filter(e => e.properties?.load_time_ms > 2000)
          .map(e => ({
            timestamp: e.timestamp,
            loadTime: e.properties!.load_time_ms,
            searchTerm: e.properties?.search_term,
            resultCount: e.properties?.results_count
          }));
      }

      // Sort top items by frequency
      insights.topPages = Object.fromEntries(
        Object.entries(insights.topPages).sort(([,a], [,b]) => b - a).slice(0, 10)
      );
      insights.topSearches = Object.fromEntries(
        Object.entries(insights.topSearches).sort(([,a], [,b]) => b - a).slice(0, 10)
      );
      insights.topSpecies = Object.fromEntries(
        Object.entries(insights.topSpecies).sort(([,a], [,b]) => b - a).slice(0, 10)
      );

      console.log(`✅ Vercel Analytics Service: Generated insights for ${filteredEvents.length} events`);
      
      return jsonResponse(insights);
    }

    // Get real-time statistics
    if (method === 'GET' && url.pathname.endsWith('/stats')) {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      // Calculate real-time stats
      const recent24h = analyticsEvents.filter(e => new Date(e.timestamp) >= last24h);
      const recentHour = analyticsEvents.filter(e => new Date(e.timestamp) >= lastHour);

      const stats = {
        server: {
          runtime: 'nodejs-vercel',
          timestamp: new Date().toISOString()
        },
        data: {
          totalEvents: analyticsEvents.length,
          totalSessions: activeSessions.size,
          events24h: recent24h.length,
          eventsLastHour: recentHour.length
        },
        performance: {
          eventsPerSecond: recentHour.length / 3600,
          averageEventSize: analyticsEvents.length > 0 ? 
            JSON.stringify(analyticsEvents).length / analyticsEvents.length : 0
        }
      };

      return jsonResponse(stats);
    }

    // Get session details
    if (method === 'GET' && url.pathname.includes('/sessions/')) {
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 1];
      const session = activeSessions.get(sessionId);

      if (!session) {
        return jsonResponse({ error: 'Session not found' }, 404);
      }

      return jsonResponse(session);
    }

    // Export analytics data
    if (method === 'GET' && url.pathname.endsWith('/export')) {
      const searchParams = url.searchParams;
      const format = searchParams.get('format') || 'json';
      const days = parseInt(searchParams.get('days') || '7');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const exportData = analyticsEvents.filter(e => new Date(e.timestamp) >= cutoffDate);
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'timestamp,event,sessionId,userId,page,properties\n';
        const csvData = exportData.map(e => 
          `"${e.timestamp}","${e.event}","${e.sessionId || ''}","${e.userId || ''}","${e.page || ''}","${JSON.stringify(e.properties || {})}"`
        ).join('\n');
        
        return new Response(csvHeader + csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics-${days}days.csv"`,
            ...corsHeaders
          }
        });
      } else {
        return jsonResponse({
          exportedAt: new Date().toISOString(),
          days: days,
          totalEvents: exportData.length,
          events: exportData
        });
      }
    }

    // Default 404 for unknown endpoints
    return jsonResponse({ 
      error: 'Endpoint not found',
      available: [
        'GET /api/analytics/health',
        'POST /api/analytics/events',
        'POST /api/analytics/insights',
        'GET /api/analytics/stats',
        'GET /api/analytics/sessions/:sessionId',
        'GET /api/analytics/export'
      ]
    }, 404);

  } catch (error) {
    console.error('❌ Vercel Analytics Service Exception:', error);
    return jsonResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}