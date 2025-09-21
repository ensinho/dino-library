const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// In-memory storage for real-time data
let analyticsEvents = [];
let activeSessions = new Map();
let serverStats = {
  startTime: new Date().toISOString(),
  totalEventsReceived: 0,
  totalSessionsTracked: 0,
  uptime: 0
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`📊 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize data directory and files
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Load existing events if file exists
    try {
      const eventsData = await fs.readFile(EVENTS_FILE, 'utf8');
      analyticsEvents = JSON.parse(eventsData);
      console.log(`📊 Loaded ${analyticsEvents.length} existing events`);
    } catch (error) {
      console.log('📊 No existing events file, starting fresh');
      analyticsEvents = [];
    }

    // Load existing sessions if file exists
    try {
      const sessionsData = await fs.readFile(SESSIONS_FILE, 'utf8');
      const sessionArray = JSON.parse(sessionsData);
      activeSessions = new Map(sessionArray);
      console.log(`📊 Loaded ${activeSessions.size} existing sessions`);
    } catch (error) {
      console.log('📊 No existing sessions file, starting fresh');
      activeSessions = new Map();
    }
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
  }
}

// Persist data to files
async function persistData() {
  try {
    // Save events
    await fs.writeFile(EVENTS_FILE, JSON.stringify(analyticsEvents, null, 2));
    
    // Save sessions (convert Map to Array for JSON)
    const sessionArray = Array.from(activeSessions.entries());
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessionArray, null, 2));
    
    console.log(`💾 Persisted ${analyticsEvents.length} events and ${activeSessions.size} sessions`);
  } catch (error) {
    console.error('❌ Failed to persist data:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = Math.floor(process.uptime());
  serverStats.uptime = uptime;
  
  res.json({ 
    status: 'healthy', 
    service: 'analytics-service', 
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
    stats: {
      eventsInMemory: analyticsEvents.length,
      activeSessions: activeSessions.size,
      totalEventsReceived: serverStats.totalEventsReceived,
      totalSessionsTracked: serverStats.totalSessionsTracked
    }
  });
});

// Receive and process analytics events
app.post('/api/events', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        expected: 'Array of events' 
      });
    }

    console.log(`📊 Analytics Service: Received ${events.length} events`);
    
    const processedEvents = [];
    
    // Process each event
    events.forEach(event => {
      // Validate event structure
      if (!event.event || !event.timestamp) {
        console.warn('⚠️ Invalid event structure:', event);
        return;
      }

      // Enrich event with server-side data
      const enrichedEvent = {
        ...event,
        receivedAt: new Date().toISOString(),
        serverId: 'analytics-service-1',
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

    // Update server stats
    serverStats.totalEventsReceived += processedEvents.length;
    serverStats.totalSessionsTracked = activeSessions.size;

    console.log(`✅ Analytics Service: Processed ${processedEvents.length} events. Total in memory: ${analyticsEvents.length}`);

    // Periodically persist data (every 100 events)
    if (analyticsEvents.length % 100 === 0) {
      await persistData();
    }

    res.json({ 
      success: true, 
      received: events.length,
      processed: processedEvents.length,
      totalStored: analyticsEvents.length 
    });

  } catch (error) {
    console.error('❌ Analytics Service Error:', error);
    res.status(500).json({ 
      error: 'Failed to process events',
      details: error.message 
    });
  }
});

// Generate insights from analytics data
app.post('/api/insights', async (req, res) => {
  try {
    const { from, to } = req.body;
    
    console.log(`📊 Analytics Service: Generating insights for period ${from} to ${to}`);
    
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
      topPages: {},
      topSearches: {},
      topSpecies: {},
      languages: {},
      userFlow: [],
      performance: {
        averageLoadTime: 0,
        slowQueries: []
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
    const performanceEvents = filteredEvents.filter(e => e.event === 'catalog_search' && e.properties?.load_time_ms);
    if (performanceEvents.length > 0) {
      const totalTime = performanceEvents.reduce((sum, e) => sum + (e.properties?.load_time_ms || 0), 0);
      insights.performance.averageLoadTime = Math.round(totalTime / performanceEvents.length);
      
      // Find slow queries (> 2 seconds)
      insights.performance.slowQueries = performanceEvents
        .filter(e => e.properties?.load_time_ms > 2000)
        .map(e => ({
          timestamp: e.timestamp,
          loadTime: e.properties.load_time_ms,
          searchTerm: e.properties.search_term,
          resultCount: e.properties.results_count
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

    console.log(`✅ Analytics Service: Generated insights for ${filteredEvents.length} events`);
    
    res.json(insights);
  } catch (error) {
    console.error('❌ Analytics Service Insights Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      details: error.message 
    });
  }
});

// Get real-time statistics
app.get('/api/stats', (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Calculate real-time stats
    const recent24h = analyticsEvents.filter(e => new Date(e.timestamp) >= last24h);
    const recentHour = analyticsEvents.filter(e => new Date(e.timestamp) >= lastHour);

    const stats = {
      server: {
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        startTime: serverStats.startTime
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

    res.json(stats);
  } catch (error) {
    console.error('❌ Analytics Stats Error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      details: error.message 
    });
  }
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('❌ Session lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to get session',
      details: error.message 
    });
  }
});

// Export analytics data
app.get('/api/export', async (req, res) => {
  try {
    const { format = 'json', days = 7 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const exportData = analyticsEvents.filter(e => new Date(e.timestamp) >= cutoffDate);
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'timestamp,event,sessionId,userId,page,properties\n';
      const csvData = exportData.map(e => 
        `"${e.timestamp}","${e.event}","${e.sessionId || ''}","${e.userId || ''}","${e.page || ''}","${JSON.stringify(e.properties || {})}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${days}days.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        exportedAt: new Date().toISOString(),
        days: parseInt(days),
        totalEvents: exportData.length,
        events: exportData
      });
    }
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available: [
      'GET /health',
      'POST /api/events',
      'POST /api/insights',
      'GET /api/stats',
      'GET /api/sessions/:sessionId',
      'GET /api/export'
    ]
  });
});

// Graceful shutdown with data persistence
async function gracefulShutdown() {
  console.log('📊 Analytics Service shutting down gracefully...');
  try {
    await persistData();
    console.log('💾 Data persisted successfully');
  } catch (error) {
    console.error('❌ Failed to persist data during shutdown:', error);
  }
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Periodic data persistence (every 5 minutes)
setInterval(persistData, 5 * 60 * 1000);

// Initialize and start server
initializeStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`📊 Analytics Service running on http://localhost:${PORT}`);
    console.log(`📈 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API Base: http://localhost:${PORT}/api`);
    console.log(`💾 Data directory: ${DATA_DIR}`);
  });
});