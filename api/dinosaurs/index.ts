// Dinosaur Service - Serverless Function for Vercel with Deno
// @ts-ignore: Module resolution for Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Type declarations for runtime environment
declare var Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Types
interface DinosaurData {
  row_index?: number;
  common_name?: string;
  scientific_name?: string;
  geological_period?: string;
  diet?: string;
  length_meters?: string;
  weight_tons?: string;
  lived_in?: string;
  discovery_year?: string;
  fun_fact?: string;
  image_url?: string;
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Supabase client - Environment variables
const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Transform database dinosaur to API format
function transformDinosaur(dino: DinosaurData) {
  return {
    id: dino.row_index?.toString() || Math.random().toString(),
    name: dino.common_name || 'Unknown',
    species: dino.scientific_name || 'Unknown species',
    period: dino.geological_period || 'Unknown',
    diet: dino.diet || 'Unknown',
    length: parseFloat(dino.length_meters || '0'),
    weight: parseFloat(dino.weight_tons || '0') * 1000, // Convert tons to kg
    habitat: dino.lived_in || 'Unknown',
    discovered_year: parseInt(dino.discovery_year || '0'),
    country: dino.lived_in || 'Unknown',
    fun_fact: dino.fun_fact || 'No fun fact available',
    image_url: dino.image_url || null
  };
}

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
        service: 'dinosaur-service-vercel',
        timestamp: new Date().toISOString(),
        runtime: 'deno'
      });
    }

    // Get dinosaurs with filtering and pagination
    if (method === 'POST' && url.pathname.endsWith('/dinosaurs')) {
      const body = await request.json().catch(() => ({}));
      const { 
        search = '', 
        period = '', 
        diet = '', 
        country = '', 
        page = 1, 
        limit = 12 
      } = body;
      
      console.log('🦕 Vercel Dinosaur Service: Fetching dinosaurs with filters:', {
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
        console.error('❌ Vercel Dinosaur Service Database Error:', error);
        return jsonResponse({ 
          error: 'Database query failed', 
          details: error.message 
        }, 500);
      }

      // Transform data
      const transformedData = (data || []).map(transformDinosaur);
      const totalPages = Math.ceil((count || 0) / limit);

      console.log(`✅ Vercel Dinosaur Service: Found ${transformedData.length} dinosaurs (Total: ${count})`);

      return jsonResponse({
        data: transformedData,
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      });
    }

    // Get single dinosaur by ID
    if (method === 'GET') {
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      if (id && id !== 'dinosaurs') {
        console.log(`🦕 Vercel Dinosaur Service: Fetching dinosaur with ID: ${id}`);
        
        const { data, error } = await supabase
          .from('dinosaur_species2')
          .select('*')
          .eq('row_index', id)
          .single();

        if (error || !data) {
          console.log(`❌ Dinosaur with ID ${id} not found`);
          return jsonResponse({ error: 'Dinosaur not found' }, 404);
        }

        const transformedDino = transformDinosaur(data);
        console.log(`✅ Vercel Dinosaur Service: Found dinosaur: ${transformedDino.name}`);
        
        return jsonResponse(transformedDino);
      }
    }

    // Get dinosaur statistics
    if (method === 'GET' && url.pathname.endsWith('/stats')) {
      console.log('📊 Vercel Dinosaur Service: Calculating statistics...');
      
      const { data, error } = await supabase
        .from('dinosaur_species2')
        .select('diet, geological_period, lived_in, length_meters, discovery_year');

      if (error) {
        console.error('❌ Stats query error:', error);
        return jsonResponse({ 
          error: 'Failed to fetch statistics',
          details: error.message 
        }, 500);
      }

      // Calculate comprehensive statistics
      const stats = {
        totalSpecies: data.length,
        averageLength: 0,
        mostCommonPeriod: '',
        latestDiscovery: 0,
        byDiet: {} as Record<string, number>,
        byPeriod: {} as Record<string, number>,
        byLocation: {} as Record<string, number>
      };

      let totalLength = 0;
      let lengthCount = 0;
      let latestYear = 0;

      data.forEach((dino: DinosaurData) => {
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
        const length = parseFloat(dino.length_meters || '0');
        if (length && length > 0) {
          totalLength += length;
          lengthCount++;
        }

        // Discovery year
        const year = parseInt(dino.discovery_year || '0');
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

      console.log(`✅ Vercel Dinosaur Service: Statistics calculated for ${stats.totalSpecies} species`);
      
      return jsonResponse(stats);
    }

    // Get available filter options
    if (method === 'GET' && url.pathname.endsWith('/filters')) {
      console.log('🔍 Vercel Dinosaur Service: Fetching filter options...');
      
      const { data, error } = await supabase
        .from('dinosaur_species2')
        .select('diet, geological_period, lived_in');

      if (error) {
        return jsonResponse({ 
          error: 'Failed to fetch filter options',
          details: error.message 
        }, 500);
      }

      // Extract unique values for each filter
      const filters = {
        periods: [...new Set(data.map((d: DinosaurData) => d.geological_period).filter(Boolean))].sort(),
        diets: [...new Set(data.map((d: DinosaurData) => d.diet).filter(Boolean))].sort(),
        countries: [...new Set(data.map((d: DinosaurData) => d.lived_in).filter(Boolean))].sort()
      };

      console.log(`✅ Vercel Dinosaur Service: Filter options extracted`);
      
      return jsonResponse(filters);
    }

    // Default 404 for unknown endpoints
    return jsonResponse({ 
      error: 'Endpoint not found',
      available: [
        'GET /api/dinosaurs/health',
        'POST /api/dinosaurs',
        'GET /api/dinosaurs/:id',
        'GET /api/dinosaurs/stats',
        'GET /api/dinosaurs/filters'
      ]
    }, 404);

  } catch (error) {
    console.error('❌ Vercel Dinosaur Service Exception:', error);
    return jsonResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}