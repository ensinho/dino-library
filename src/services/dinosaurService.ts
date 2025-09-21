/**
 * Dinosaur Service
 * 
 * This service handles all dinosaur-related data operations.
 * It implements a hybrid architecture:
 * 1. First tries to use microservices for scalability
 * 2. Falls back to direct Supabase calls for reliability
 * 3. Provides caching and optimization features
 */

import { supabase } from '@/integrations/supabase/client';
import config from '@/lib/config';

// Type definitions matching your database schema
export interface DinosaurSpecies {
  behavior_notes: string | null;
  common_name: string | null;
  diet: string | null;
  first_discovered: string | null;
  fossil_location: string | null;
  geological_period: string | null;
  height_m: number | null;
  intelligence_level: string | null;
  length_m: number | null;
  lived_in: string | null;
  locomotion: string | null;
  meaning: string | null;
  notable_features: string | null;
  row_index: string;
  scientific_name: string | null;
  source_link: string | null;
  weight_kg: number | null;
  image_url?: string | null;
}

export interface DinosaurFilters {
  search?: string;
  period?: string;
  diet?: string;
  location?: string;
  lengthRange?: [number, number];
  heightRange?: [number, number];
  page?: number;
  limit?: number;
}

export interface DinosaurResponse {
  data: DinosaurSpecies[];
  total: number;
  page: number;
  totalPages: number;
}

export class DinosaurService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get dinosaurs with filtering and pagination
   * Uses Supabase directly for better performance and reliability
   */
  async getDinosaurs(filters: DinosaurFilters = {}): Promise<DinosaurResponse> {
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      if (config.debugMode) {
        console.log('🦕 Using cached dinosaurs');
      }
      return cached;
    }

    try {
      if (config.debugMode) {
        console.log('🦕 Fetching dinosaurs directly from Supabase:', filters);
      }
      
      const response = await this.getDirectFromSupabase(filters);
      this.setCache(cacheKey, response);
      return response;

    } catch (error) {
      console.error('❌ Error fetching dinosaurs:', error);
      // Return empty result instead of throwing
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    }
  }

  /**
   * Get a specific dinosaur by ID
   * Uses Supabase directly
   */
  async getDinosaurById(id: string): Promise<DinosaurSpecies> {
    const cacheKey = `dinosaur-${id}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (config.debugMode) {
        console.log(`🦕 Fetching dinosaur ${id} from Supabase...`);
      }
      
      const { data, error: supabaseError } = await supabase
        .from('dinosaur_species2')
        .select('*')
        .eq('row_index', id)
        .single();
      
      if (supabaseError) throw supabaseError;
      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      console.error(`❌ Error fetching dinosaur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get dinosaur statistics (for dashboard/analytics)
   */
  async getDinosaurStats(): Promise<{
    totalSpecies: number;
    periodDistribution: Record<string, number>;
    dietDistribution: Record<string, number>;
    locationDistribution: Record<string, number>;
  }> {
    const cacheKey = 'dinosaur-stats';
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (config.debugMode) {
        console.log('📊 Fetching stats from Supabase...');
      }
      
      const stats = await this.calculateStatsFromSupabase();
      this.setCache(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Return default stats
      return {
        totalSpecies: 0,
        periodDistribution: {},
        dietDistribution: {},
        locationDistribution: {}
      };
    }
  }

  /**
   * Search dinosaurs with fuzzy matching
   */
  async searchDinosaurs(query: string, limit: number = 10): Promise<DinosaurSpecies[]> {
    const cacheKey = `search-${query}-${limit}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (config.debugMode) {
        console.log('🔍 Searching dinosaurs in Supabase...');
      }
      
      const results = await this.searchInSupabase(query, limit);
      this.setCache(cacheKey, results);
      return results;

    } catch (error) {
      console.error('❌ Error searching dinosaurs:', error);
      return [];
    }
  }

  /**
   * Direct Supabase implementation (fallback)
   */
  private async getDirectFromSupabase(filters: DinosaurFilters): Promise<DinosaurResponse> {
    let query = supabase.from('dinosaur_species2').select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`common_name.ilike.%${filters.search}%,scientific_name.ilike.%${filters.search}%`);
    }

    if (filters.period && filters.period !== 'all') {
      query = query.eq('geological_period', filters.period);
    }

    if (filters.diet && filters.diet !== 'all') {
      query = query.eq('diet', filters.diet);
    }

    if (filters.location && filters.location !== 'all') {
      query = query.eq('lived_in', filters.location);
    }

    // Apply size filters
    if (filters.lengthRange) {
      query = query.gte('length_m', filters.lengthRange[0]).lte('length_m', filters.lengthRange[1]);
    }

    if (filters.heightRange) {
      query = query.gte('height_m', filters.heightRange[0]).lte('height_m', filters.heightRange[1]);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;
    
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Search implementation for Supabase fallback
   */
  private async searchInSupabase(query: string, limit: number): Promise<DinosaurSpecies[]> {
    const { data, error } = await supabase
      .from('dinosaur_species2')
      .select('*')
      .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%,behavior_notes.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate statistics from Supabase (fallback)
   */
  private async calculateStatsFromSupabase() {
    const { data, error } = await supabase
      .from('dinosaur_species2')
      .select('geological_period, diet, lived_in');

    if (error) throw error;

    const stats = {
      totalSpecies: data?.length || 0,
      periodDistribution: {} as Record<string, number>,
      dietDistribution: {} as Record<string, number>,
      locationDistribution: {} as Record<string, number>
    };

    data?.forEach(item => {
      // Count periods
      if (item.geological_period) {
        stats.periodDistribution[item.geological_period] = 
          (stats.periodDistribution[item.geological_period] || 0) + 1;
      }

      // Count diets
      if (item.diet) {
        stats.dietDistribution[item.diet] = 
          (stats.dietDistribution[item.diet] || 0) + 1;
      }

      // Count locations
      if (item.lived_in) {
        stats.locationDistribution[item.lived_in] = 
          (stats.locationDistribution[item.lived_in] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache (useful for forced refresh)
   */
  clearCache() {
    this.cache.clear();
    if (config.debugMode) {
    }
  }

  /**
   * Get unique values for filters
   * Uses Supabase directly
   */
  async getFilterOptions(): Promise<{
    periods: string[];
    diets: string[];
    locations: string[];
  }> {
    const cacheKey = 'filter-options';
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (config.debugMode) {
        console.log('🦕 Fetching filter options from Supabase...');
      }

      const { data, error: supabaseError } = await supabase
        .from('dinosaur_species2')
        .select('geological_period, diet, lived_in');

      if (supabaseError) throw supabaseError;

      const options = {
        periods: [...new Set(data?.map(d => d.geological_period).filter(Boolean))].sort() as string[],
        diets: [...new Set(data?.map(d => d.diet).filter(Boolean))].sort() as string[],
        locations: [...new Set(data?.map(d => d.lived_in).filter(Boolean))].sort() as string[]
      };

      this.setCache(cacheKey, options);
      return options;
      
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
      // Return default options
      return {
        periods: ['Triassic', 'Jurassic', 'Cretaceous'],
        diets: ['Carnivore', 'Herbivore', 'Omnivore'],
        locations: ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia']
      };
    }
  }
}

// Create singleton instance
export const dinosaurService = new DinosaurService();

export default dinosaurService;