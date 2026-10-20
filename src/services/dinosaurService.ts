/**
 * Dinosaur Service
 *
 * Firestore is the source of truth. The collection is small (~1.5k docs), so
 * it is read once per session and every filter, sort, page and stat is then
 * computed in memory. That turns each filter change from a 1 000-document
 * read into a sub-millisecond array operation.
 */

import config, { localDataMode } from '@/lib/config';
import { dinoPicturesService } from '@/services/dinoPicturesService';
import { loadLocalDataset } from '@/services/localDataset';
import { col, getDocs } from '@/services/firestoreService';
import { doc, getCountFromServer, getDoc } from 'firebase/firestore';
import {
  dietGroupOf,
  periodGroupOf,
  regionOf,
  type DietGroup,
  type PeriodGroup,
  type Region,
} from '@/lib/taxonomy';
import { applyTheme, type ThemeId } from '@/lib/themes';

const COLLECTION = 'dinosaur_species2';

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
  image_urls?: string[] | null;
  image_thumbnails?: string[] | null;
}

export type SortKey = 'name' | 'length' | 'weight' | 'discovered';

export interface DinosaurFilters {
  search?: string;
  period?: PeriodGroup;
  diet?: DietGroup;
  region?: Region;
  theme?: ThemeId;
  lengthRange?: [number, number];
  heightRange?: [number, number];
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export interface DinosaurPage {
  data: DinosaurSpecies[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DinosaurStats {
  totalSpecies: number;
  periods: Record<PeriodGroup, number>;
  diets: Record<DietGroup, number>;
  regions: Partial<Record<Region, number>>;
}

/* ------------------------------------------------------------------ */
/* Pure helpers — exported for tests and for components that already  */
/* hold the full list in memory.                                       */
/* ------------------------------------------------------------------ */

export const displayName = (d: Pick<DinosaurSpecies, 'common_name' | 'scientific_name'>) =>
  d.common_name || d.scientific_name || '';

/** The CSV import left a duplicated header row behind; drop it and other empties. */
const isRealRecord = (d: DinosaurSpecies) =>
  Boolean(d.row_index !== undefined && displayName(d)) &&
  d.scientific_name !== 'scientific_name' &&
  d.geological_period !== 'Period';

const inRange = (value: number | null, range?: [number, number]) =>
  !range || (value !== null && value >= range[0] && value <= range[1]);

const SORTERS: Record<SortKey, (a: DinosaurSpecies, b: DinosaurSpecies) => number> = {
  name: (a, b) => displayName(a).localeCompare(displayName(b)),
  length: (a, b) => (b.length_m ?? -1) - (a.length_m ?? -1),
  weight: (a, b) => (b.weight_kg ?? -1) - (a.weight_kg ?? -1),
  discovered: (a, b) =>
    (Number.parseInt(b.first_discovered ?? '', 10) || 0) - (Number.parseInt(a.first_discovered ?? '', 10) || 0),
};

export function filterDinosaurs(all: DinosaurSpecies[], filters: DinosaurFilters = {}): DinosaurSpecies[] {
  const search = filters.search?.trim().toLowerCase();

  let result = all.filter((d) => {
    if (filters.period && periodGroupOf(d.geological_period) !== filters.period) return false;
    if (filters.diet && dietGroupOf(d.diet) !== filters.diet) return false;
    if (filters.region && regionOf(d.lived_in, d.fossil_location) !== filters.region) return false;
    if (!inRange(d.length_m, filters.lengthRange)) return false;
    if (!inRange(d.height_m, filters.heightRange)) return false;
    if (search) {
      const haystack = `${d.common_name ?? ''} ${d.scientific_name ?? ''} ${d.meaning ?? ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // A theme carries its own ordering (e.g. giants by length) unless the user picked one.
  if (filters.theme) result = applyTheme(result, filters.theme);
  if (filters.sort || !filters.theme) result = [...result].sort(SORTERS[filters.sort ?? 'name']);

  return result;
}

export function paginate<T>(items: T[], page = 1, limit = 12) {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * limit;
  return { data: items.slice(start, start + limit), total: items.length, page: current, totalPages };
}

export function computeStats(all: DinosaurSpecies[]): DinosaurStats {
  const stats: DinosaurStats = {
    totalSpecies: all.length,
    periods: { triassic: 0, jurassic: 0, cretaceous: 0 },
    diets: { carnivore: 0, herbivore: 0, omnivore: 0 },
    regions: {},
  };
  for (const d of all) {
    const p = periodGroupOf(d.geological_period);
    const diet = dietGroupOf(d.diet);
    const r = regionOf(d.lived_in, d.fossil_location);
    if (p) stats.periods[p]++;
    if (diet) stats.diets[diet]++;
    if (r) stats.regions[r] = (stats.regions[r] ?? 0) + 1;
  }
  return stats;
}

/**
 * Species that share the most traits with `target` — same period first,
 * then same diet and region, ties broken by similar body length.
 */
export function relatedTo(target: DinosaurSpecies, all: DinosaurSpecies[], count = 4): DinosaurSpecies[] {
  const period = periodGroupOf(target.geological_period);
  const diet = dietGroupOf(target.diet);
  const region = regionOf(target.lived_in, target.fossil_location);
  const length = target.length_m ?? 0;

  return all
    .filter((d) => d.row_index !== target.row_index)
    .map((d) => {
      let score = 0;
      if (period && periodGroupOf(d.geological_period) === period) score += 3;
      if (diet && dietGroupOf(d.diet) === diet) score += 2;
      if (region && regionOf(d.lived_in, d.fossil_location) === region) score += 2;
      if (d.image_url) score += 1;
      return { d, score, delta: Math.abs((d.length_m ?? 0) - length) };
    })
    .sort((a, b) => b.score - a.score || a.delta - b.delta)
    .slice(0, count)
    .map((x) => x.d);
}

/* ------------------------------------------------------------------ */
/* Data access                                                          */
/* ------------------------------------------------------------------ */

export class DinosaurService {
  private allPromise: Promise<DinosaurSpecies[]> | null = null;
  private byId = new Map<string, DinosaurSpecies>();

  /** Every species, fetched once and shared by all callers. */
  getAll(): Promise<DinosaurSpecies[]> {
    if (!this.allPromise) {
      const source = localDataMode
        ? loadLocalDataset()
        : getDocs(col(COLLECTION)).then((snap) =>
            snap.docs.map((d) => ({ ...(d.data() as DinosaurSpecies), row_index: String(d.data().row_index ?? d.id) })),
          );
      this.allPromise = source
        .then((docs) => {
          const items = docs.filter(isRealRecord);
          items.forEach((d) => this.byId.set(d.row_index, d));
          return items;
        })
        .catch((error) => {
          // Don't cache a failure — the next caller should retry.
          this.allPromise = null;
          throw error;
        });
    }
    return this.allPromise;
  }

  async getDinosaurs(filters: DinosaurFilters = {}): Promise<DinosaurPage> {
    const all = await this.getAll();
    return paginate(filterDinosaurs(all, filters), filters.page, filters.limit);
  }

  /** Resolves from memory when possible; images are enriched separately. */
  async getDinosaurById(id: string): Promise<DinosaurSpecies> {
    const cached = this.byId.get(id);
    if (cached) return cached;

    if (!localDataMode) {
      const snap = await getDoc(doc(col(COLLECTION), id));
      if (snap.exists()) {
        const data = { ...(snap.data() as DinosaurSpecies), row_index: id };
        this.byId.set(id, data);
        return data;
      }
    }

    // Document ids may not match `row_index` — fall back to the full list.
    const match = (await this.getAll()).find((d) => d.row_index === id);
    if (!match) throw new Error('not-found');
    return match;
  }

  async getStats(): Promise<DinosaurStats> {
    return computeStats(await this.getAll());
  }

  /** Cheap aggregate count (1 read per 1 000 index entries) for the landing page. */
  async getCount(): Promise<number> {
    if (this.allPromise || localDataMode) return (await this.getAll()).length;
    const snap = await getCountFromServer(col(COLLECTION));
    return snap.data().count;
  }

  /**
   * Fill `image_url` from dinosaurpictures.org for the given species.
   * Mutates the shared records so the result is reused everywhere.
   * Concurrency is bounded to stay polite with the public API.
   */
  async enrichImages(items: DinosaurSpecies[], concurrency = 3): Promise<void> {
    const queue = items.filter((d) => !d.image_url && displayName(d));
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        await this.withImage(next);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  }

  private async withImage(d: DinosaurSpecies): Promise<DinosaurSpecies> {
    if (d.image_url) return d;
    try {
      const enrichment = await dinoPicturesService.getDinosaur(d.scientific_name || d.common_name || '');
      const first = enrichment?.images?.[0]?.url;
      if (first) d.image_url = first;
    } catch (e) {
      if (config.debugMode) console.warn('🖼️ DinoPictures enrichment failed:', displayName(d), e);
    }
    return d;
  }
}

export const dinosaurService = new DinosaurService();

export default dinosaurService;
