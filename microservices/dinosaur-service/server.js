const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Supabase client - using the same credentials from the main app
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://rjbcxjxveksuuvlosmsy.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqYmN4anh2ZWtzdXV2bG9zbXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzM5NzYsImV4cCI6MjA3MTEwOTk3Nn0.rkoDQ7kc_RfAHShSxe3sX8QCqCxteBxUzSGoWbfgC30'
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`🦕 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'dinosaur-service', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// Get dinosaurs with advanced filtering and pagination
app.post('/api/dinosaurs', async (req, res) => {
  try {
    const { 
      search = '', 
      period = '', 
      diet = '', 
      country = '', 
      page = 1, 
      limit = 12 
    } = req.body;
    
    console.log('🦕 Dinosaur Service: Fetching dinosaurs with filters:', {
      search, period, diet, country, page, limit
    });
    
    let query = supabase
      .from('dinosaur_species2')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(`common_name.ilike.%${search}%,scientific_name.ilike.%${search}%,fun_fact.ilike.%${search}%`);
    }

    // Apply period filter
    if (period && period !== '' && period !== 'all') {
      query = query.eq('geological_period', period);
    }

    // Apply diet filter
    if (diet && diet !== '' && diet !== 'all') {
      query = query.eq('diet', diet);
    }

    // Apply country filter
    if (country && country !== '' && country !== 'all') {
      query = query.eq('lived_in', country);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Add ordering
    query = query.order('common_name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Dinosaur Service Database Error:', error);
      return res.status(500).json({ 
        error: 'Database query failed', 
        details: error.message 
      });
    }

    // Transform data to match expected format
    const transformedData = (data || []).map(dino => ({
      id: dino.row_index?.toString() || Math.random().toString(),
      name: dino.common_name || 'Unknown',
      species: dino.scientific_name || 'Unknown species',
      period: dino.geological_period || 'Unknown',
      diet: dino.diet || 'Unknown',
      length: parseFloat(dino.length_meters || 0),
      weight: parseFloat(dino.weight_tons || 0) * 1000, // Convert tons to kg
      habitat: dino.lived_in || 'Unknown',
      discovered_year: parseInt(dino.discovery_year || 0),
      country: dino.lived_in || 'Unknown',
      fun_fact: dino.fun_fact || 'No fun fact available',
      image_url: dino.image_url || null
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    console.log(`✅ Dinosaur Service: Found ${transformedData.length} dinosaurs (Total: ${count}, Page: ${page}/${totalPages})`);

    res.json({
      data: transformedData,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('❌ Dinosaur Service Exception:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get single dinosaur by ID
app.get('/api/dinosaurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🦕 Dinosaur Service: Fetching dinosaur with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('dinosaur_species2')
      .select('*')
      .eq('row_index', id)
      .single();

    if (error || !data) {
      console.log(`❌ Dinosaur with ID ${id} not found`);
      return res.status(404).json({ error: 'Dinosaur not found' });
    }

    // Transform single dinosaur data
    const transformedDino = {
      id: data.row_index?.toString() || id,
      name: data.common_name || 'Unknown',
      species: data.scientific_name || 'Unknown species',
      period: data.geological_period || 'Unknown',
      diet: data.diet || 'Unknown',
      length: parseFloat(data.length_meters || 0),
      weight: parseFloat(data.weight_tons || 0) * 1000,
      habitat: data.lived_in || 'Unknown',
      discovered_year: parseInt(data.discovery_year || 0),
      country: data.lived_in || 'Unknown',
      fun_fact: data.fun_fact || 'No fun fact available',
      image_url: data.image_url || null
    };

    console.log(`✅ Dinosaur Service: Found dinosaur: ${transformedDino.name}`);
    
    res.json(transformedDino);
  } catch (error) {
    console.error('❌ Dinosaur Service Exception:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get dinosaur statistics
app.get('/api/dinosaurs/stats', async (req, res) => {
  try {
    console.log('📊 Dinosaur Service: Calculating statistics...');
    
    const { data, error } = await supabase
      .from('dinosaur_species2')
      .select('diet, geological_period, lived_in, length_meters, discovery_year');

    if (error) {
      console.error('❌ Stats query error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch statistics',
        details: error.message 
      });
    }

    // Calculate comprehensive statistics
    const stats = {
      totalSpecies: data.length,
      averageLength: 0,
      mostCommonPeriod: '',
      latestDiscovery: 0,
      byDiet: {},
      byPeriod: {},
      byLocation: {},
      lengthDistribution: {
        small: 0,    // < 5m
        medium: 0,   // 5-15m
        large: 0,    // 15-30m
        huge: 0      // > 30m
      }
    };

    let totalLength = 0;
    let lengthCount = 0;
    let latestYear = 0;

    data.forEach(dino => {
      // Diet statistics
      if (dino.diet) {
        stats.byDiet[dino.diet] = (stats.byDiet[dino.diet] || 0) + 1;
      }
      
      // Period statistics
      if (dino.geological_period) {
        stats.byPeriod[dino.geological_period] = (stats.byPeriod[dino.geological_period] || 0) + 1;
      }
      
      // Location statistics
      if (dino.lived_in) {
        stats.byLocation[dino.lived_in] = (stats.byLocation[dino.lived_in] || 0) + 1;
      }

      // Length statistics
      const length = parseFloat(dino.length_meters);
      if (length && length > 0) {
        totalLength += length;
        lengthCount++;

        if (length < 5) stats.lengthDistribution.small++;
        else if (length < 15) stats.lengthDistribution.medium++;
        else if (length < 30) stats.lengthDistribution.large++;
        else stats.lengthDistribution.huge++;
      }

      // Discovery year
      const year = parseInt(dino.discovery_year);
      if (year && year > latestYear) {
        latestYear = year;
      }
    });

    // Calculate averages and most common
    stats.averageLength = lengthCount > 0 ? Math.round((totalLength / lengthCount) * 10) / 10 : 0;
    stats.latestDiscovery = latestYear;

    // Find most common period
    let maxPeriodCount = 0;
    Object.entries(stats.byPeriod).forEach(([period, count]) => {
      if (count > maxPeriodCount) {
        maxPeriodCount = count;
        stats.mostCommonPeriod = period;
      }
    });

    console.log(`✅ Dinosaur Service: Statistics calculated for ${stats.totalSpecies} species`);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Dinosaur Service Stats Exception:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get available filter options
app.get('/api/dinosaurs/filters', async (req, res) => {
  try {
    console.log('🔍 Dinosaur Service: Fetching filter options...');
    
    const { data, error } = await supabase
      .from('dinosaur_species2')
      .select('diet, geological_period, lived_in');

    if (error) {
      return res.status(500).json({ 
        error: 'Failed to fetch filter options',
        details: error.message 
      });
    }

    // Extract unique values for each filter
    const filters = {
      periods: [...new Set(data.map(d => d.geological_period).filter(Boolean))].sort(),
      diets: [...new Set(data.map(d => d.diet).filter(Boolean))].sort(),
      countries: [...new Set(data.map(d => d.lived_in).filter(Boolean))].sort()
    };

    console.log(`✅ Dinosaur Service: Filter options extracted`);
    
    res.json(filters);
  } catch (error) {
    console.error('❌ Dinosaur Service Filters Exception:', error);
    res.status(500).json({ 
      error: 'Internal server error',
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
      'POST /api/dinosaurs',
      'GET /api/dinosaurs/:id',
      'GET /api/dinosaurs/stats',
      'GET /api/dinosaurs/filters'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🦕 Dinosaur Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/dinosaurs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🦕 Dinosaur Service shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🦕 Dinosaur Service shutting down gracefully...');
  process.exit(0);
});