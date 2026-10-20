import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { computeStats, filterDinosaurs, paginate, relatedTo, type DinosaurSpecies } from './dinosaurService';
import { coordinatesOf, regionOf } from '@/lib/taxonomy';
import { THEMES, applyTheme } from '@/lib/themes';

const species = (overrides: Partial<DinosaurSpecies>): DinosaurSpecies => ({
  behavior_notes: null,
  common_name: null,
  diet: null,
  first_discovered: null,
  fossil_location: null,
  geological_period: null,
  height_m: null,
  intelligence_level: null,
  length_m: null,
  lived_in: null,
  locomotion: null,
  meaning: null,
  notable_features: null,
  row_index: '0',
  scientific_name: null,
  source_link: null,
  weight_kg: null,
  ...overrides,
});

const sample = [
  species({ row_index: '1', common_name: 'Tyrannosaurus', diet: 'Carnivore', geological_period: 'Late Cretaceous', lived_in: 'North America', length_m: 12, weight_kg: 8000 }),
  species({ row_index: '2', common_name: 'Stegosaurus', diet: 'Herbivore', geological_period: 'Late Jurassic', lived_in: 'USA', length_m: 9 }),
  species({ row_index: '3', common_name: 'Argentinosaurus', diet: 'Herbivore', geological_period: 'Late Cretaceous (Cenomanian)', lived_in: 'Argentina', length_m: 35 }),
  species({ row_index: '4', common_name: 'Coelophysis', diet: 'Carnivore', geological_period: 'Late Triassic', lived_in: 'North America', length_m: 3 }),
];

describe('filterDinosaurs', () => {
  it('filters by normalised period, diet and region', () => {
    expect(filterDinosaurs(sample, { period: 'cretaceous' }).map((d) => d.row_index)).toEqual(['3', '1']);
    expect(filterDinosaurs(sample, { diet: 'carnivore', region: 'north_america' })).toHaveLength(2);
    expect(filterDinosaurs(sample, { region: 'south_america' }).map((d) => d.common_name)).toEqual(['Argentinosaurus']);
  });

  it('searches names case-insensitively', () => {
    expect(filterDinosaurs(sample, { search: 'SAURUS' })).toHaveLength(3);
  });

  it('applies size ranges and excludes unknown sizes', () => {
    expect(filterDinosaurs(sample, { lengthRange: [10, 50] }).map((d) => d.row_index)).toEqual(['3', '1']);
  });

  it('sorts by the requested key', () => {
    expect(filterDinosaurs(sample, { sort: 'length' })[0].common_name).toBe('Argentinosaurus');
    expect(filterDinosaurs(sample, { sort: 'weight' })[0].common_name).toBe('Tyrannosaurus');
  });
});

describe('paginate', () => {
  it('clamps out-of-range pages', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    expect(paginate(items, 3, 10)).toMatchObject({ data: [20, 21, 22, 23, 24], page: 3, totalPages: 3 });
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate([], 1, 10)).toMatchObject({ data: [], total: 0, totalPages: 1 });
  });
});

describe('relatedTo', () => {
  it('ranks by shared traits and never returns the target itself', () => {
    // Coelophysis shares diet + region (4 pts), Argentinosaurus only the period (3 pts).
    expect(relatedTo(sample[0], sample, 2).map((d) => d.row_index)).toEqual(['4', '3']);
  });
});

describe('computeStats', () => {
  it('counts each bucket', () => {
    const stats = computeStats(sample);
    expect(stats.totalSpecies).toBe(4);
    expect(stats.periods).toEqual({ triassic: 1, jurassic: 1, cretaceous: 2 });
    expect(stats.diets.carnivore).toBe(2);
  });
});

/**
 * Coverage checks against the real dataset — these guard the regressions
 * that made the old equality filters return almost nothing.
 */
describe('real dataset', () => {
  const csv = fs.readFileSync(path.resolve(__dirname, '../../scripts/data/dinosaur_genera.csv'), 'utf8');
  const rows = (parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[]).map((r) =>
    species({ ...r, length_m: Number(r.length_m) || null, weight_kg: Number(r.weight_kg) || null } as Partial<DinosaurSpecies>),
  );

  it('assigns a period to almost every species', () => {
    const stats = computeStats(rows);
    const total = stats.periods.triassic + stats.periods.jurassic + stats.periods.cretaceous;
    expect(total / rows.length).toBeGreaterThan(0.98);
  });

  it('assigns a region to almost every species', () => {
    const located = rows.filter((d) => regionOf(d.lived_in, d.fossil_location));
    expect(located.length / rows.length).toBeGreaterThan(0.97);
  });

  it('places almost every species on the map', () => {
    const mapped = rows.filter((d) => coordinatesOf(d.fossil_location, d.lived_in));
    expect(mapped.length / rows.length).toBeGreaterThan(0.97);
  });

  it('every Discover theme has something to show', () => {
    for (const theme of THEMES) {
      expect(applyTheme(rows, theme.id).length, theme.id).toBeGreaterThan(3);
    }
  });
});
