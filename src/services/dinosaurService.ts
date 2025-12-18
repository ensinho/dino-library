/**
 * Dinosaur Service
 * 
 * This service handles all dinosaur-related data operations.
 * It reads from Firestore and includes caching/optimization.
 */

import config from '@/lib/config';
import {
  col,
  getDocs,
  limit as fsLimit,
  query as fsQuery,
  where as fsWhere,
} from '@/services/firestoreService';
import {
  doc,
  getDoc,
  orderBy,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

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

  // Firestore pagination uses cursor, but the UI expects page numbers.
  // For now, we implement page-based pagination by paging in-memory after fetching.
  // This is OK for ~1000 docs, and we can optimize later with index/cursors.

  /**
   * Get dinosaurs with filtering and pagination
  * Fetches from Firestore
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
        console.log('🦕 Fetching dinosaurs from Firestore:', filters);
      }
      
      const response = await this.getFromFirestore(filters);
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
  * Fetches from Firestore
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
        console.log(`🦕 Fetching dinosaur ${id} from Firestore...`);
      }

      const snap = await getDoc(doc(col('dinosaur_species2'), id));
      if (!snap.exists()) {
        throw new Error('Dinosaur not found');
      }
      const data = snap.data() as DinosaurSpecies;
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
        console.log('📊 Fetching stats from Firestore...');
      }
      
  const stats = await this.calculateStatsFromFirestore();
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
        console.log('🔍 Searching dinosaurs in Firestore...');
      }
      
  const results = await this.searchInFirestore(query, limit);
      this.setCache(cacheKey, results);
      return results;

    } catch (error) {
      console.error('❌ Error searching dinosaurs:', error);
      return [];
    }
  }

  /**
   * Firestore implementation
   */
  private async getFromFirestore(filters: DinosaurFilters): Promise<DinosaurResponse> {
    // We'll fetch a superset and apply complex filters client-side.
    // Firestore doesn't support OR/ILIKE easily without extra indexing/denormalization.
    const base = col('dinosaur_species2');
    const page = filters.page || 1;
    const pageSize = filters.limit || 12;

    // Narrow down via equality filters where we can (cheap).
    const wheres: any[] = [];
    if (filters.period && filters.period !== 'all') wheres.push(fsWhere('geological_period', '==', filters.period));
    if (filters.diet && filters.diet !== 'all') wheres.push(fsWhere('diet', '==', filters.diet));
    if (filters.location && filters.location !== 'all') wheres.push(fsWhere('lived_in', '==', filters.location));

    // Pull a reasonable slice for UX. Increase if needed.
    const q = wheres.length
      ? fsQuery(base, ...wheres, fsLimit(1000))
      : fsQuery(base, fsLimit(1000));

    const snap = await getDocs(q);
    let data = snap.docs.map((d) => d.data() as DinosaurSpecies);

    // Search (client-side containing). Mimics ilike %query%.
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter((d) =>
        (d.common_name || '').toLowerCase().includes(s) ||
        (d.scientific_name || '').toLowerCase().includes(s)
      );
    }

    if (filters.lengthRange) {
      data = data.filter((d) => {
        const v = d.length_m ?? null;
        if (v === null) return false;
        return v >= filters.lengthRange![0] && v <= filters.lengthRange![1];
      });
    }

    if (filters.heightRange) {
      data = data.filter((d) => {
        const v = d.height_m ?? null;
        if (v === null) return false;
        return v >= filters.heightRange![0] && v <= filters.heightRange![1];
      });
    }

    // Stable-ish ordering (by scientific_name then row_index)
    data.sort((a, b) => {
      const an = (a.scientific_name || a.common_name || '').toLowerCase();
      const bn = (b.scientific_name || b.common_name || '').toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return String(a.row_index).localeCompare(String(b.row_index));
    });

    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = data.slice(start, end);

    return { data: paged, total, page, totalPages };
  }

  /**
   * Search implementation for Firestore
   */
  private async searchInFirestore(queryText: string, limitCount: number): Promise<DinosaurSpecies[]> {
    const q = fsQuery(col('dinosaur_species2'), fsLimit(1000));
    const snap = await getDocs(q);
    const s = queryText.toLowerCase();
    const all = snap.docs.map((d) => d.data() as DinosaurSpecies);
    return all
      .filter((d) =>
        (d.common_name || '').toLowerCase().includes(s) ||
        (d.scientific_name || '').toLowerCase().includes(s) ||
        (d.behavior_notes || '').toLowerCase().includes(s)
      )
      .slice(0, limitCount);
  }

  /**
   * Calculate statistics from Firestore
   */
  private async calculateStatsFromFirestore() {
    const snap = await getDocs(fsQuery(col('dinosaur_species2'), fsLimit(1000)));
    const data = snap.docs.map((d) => d.data() as Pick<DinosaurSpecies, 'geological_period' | 'diet' | 'lived_in'>);

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
   * Uses Firestore
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
        console.log('🦕 Fetching filter options from Firestore...');
      }

      const snap = await getDocs(fsQuery(col('dinosaur_species2'), fsLimit(1000)));
      const data = snap.docs.map((d) => d.data() as Pick<DinosaurSpecies, 'geological_period' | 'diet' | 'lived_in'>);

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