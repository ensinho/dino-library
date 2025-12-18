/**
 * API docs: https://dinosaurpictures.org/api
 */

import config from '@/lib/config';

export type DinoPicturesDiet = 'carnivore' | 'herbivore' | 'omnivore' | string;

export interface DinoPicturesPic {
  url?: string;
  clickthrough_url?: string;
  thumbnail?: string;
  source?: string;
  source_display?: string;
  voting_url?: string;
}

export interface DinoPicturesDinosaurResponse {
  dino: string;
  period?: string;
  eats?: DinoPicturesDiet;
  regions?: string[];
  pics?: DinoPicturesPic[];
}

export type DinoPicturesCategoryResponse = string[];

export interface DinoPicturesImage {
  url: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceDisplay?: string;
}

export interface DinoPicturesEnrichment {
  dino: string;
  period?: string;
  eats?: string;
  regions?: string[];
  images: DinoPicturesImage[];
}

// Very small in-memory cache to avoid spamming the public API while navigating.
const cache = new Map<string, { ts: number; value: unknown }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function setCached(key: string, value: unknown) {
  cache.set(key, { ts: Date.now(), value });
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function toEnrichment(payload: DinoPicturesDinosaurResponse): DinoPicturesEnrichment {
  const pics = payload.pics ?? [];
  const images: DinoPicturesImage[] = pics
    .map((p) => ({
      url: p.url || p.clickthrough_url || p.voting_url || '',
      thumbnailUrl: p.thumbnail,
      sourceUrl: p.source,
      sourceDisplay: p.source_display,
    }))
    .filter((img) => Boolean(img.url));

  return {
    dino: payload.dino,
    period: payload.period,
    eats: payload.eats,
    regions: payload.regions,
    images,
  };
}

export class DinoPicturesService {
  private baseUrl = import.meta.env.DEV
    ? '/ext/dinopics'
    : '/api/dinopics';

  /**
   * pics + some metadata for a dinosaur name.
   */
  async getDinosaur(name: string): Promise<DinoPicturesEnrichment | null> {
    const n = normalizeName(name);
    if (!n) return null;

    const cacheKey = `dino:${n.toLowerCase()}`;
    const cached = getCached<DinoPicturesEnrichment>(cacheKey);
    if (cached) return cached;

  const url = `${this.baseUrl}/dinosaur/${encodeURIComponent(n)}`;

    if (config.debugMode) {
      console.log('DinoPictures fetch:', url);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (config.debugMode) {
        console.warn('DinoPictures non-OK:', res.status, res.statusText);
      }
      return null;
    }

    const data = (await res.json()) as DinoPicturesDinosaurResponse;
    const enrichment = toEnrichment(data);
    setCached(cacheKey, enrichment);
    return enrichment;
  }

  /**
   * Fetch a list of dinosaur names for a category.
   * Categories: geographies (north-america, south-america, europe, africa, asia, australia, india, madagascar)
   * or time periods (triassic, jurassic, cretaceous) or 'all'.
   */
  async getCategory(category: string): Promise<DinoPicturesCategoryResponse> {
    const c = normalizeName(category).toLowerCase();
    const cacheKey = `cat:${c}`;
    const cached = getCached<DinoPicturesCategoryResponse>(cacheKey);
    if (cached) return cached;

  const url = `${this.baseUrl}/category/${encodeURIComponent(c)}`;

    if (config.debugMode) {
      console.log('DinoPictures category fetch:', url);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (config.debugMode) {
        console.warn('DinoPictures category non-OK:', res.status, res.statusText);
      }
      return [];
    }

    const data = (await res.json()) as DinoPicturesCategoryResponse;
    setCached(cacheKey, data);
    return data;
  }
}

export const dinoPicturesService = new DinoPicturesService();
