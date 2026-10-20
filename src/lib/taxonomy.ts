/**
 * Taxonomy helpers.
 *
 * The source dataset is hand-curated and its categorical columns are noisy:
 * `geological_period` has ~70 distinct spellings ("Late Cretaceous (Campanian)",
 * "Jurassic (?)", …), `lived_in` mixes continents and countries, and `diet`
 * carries qualifiers ("Carnivore (disputed)"). Everything the UI filters or
 * groups by goes through these pure functions so the rules live in one place
 * and can be unit-tested.
 */

export type PeriodGroup = 'triassic' | 'jurassic' | 'cretaceous';
export type DietGroup = 'carnivore' | 'herbivore' | 'omnivore';
export type Region =
  | 'north_america'
  | 'south_america'
  | 'europe'
  | 'asia'
  | 'africa'
  | 'australia'
  | 'antarctica';

export const PERIOD_GROUPS: PeriodGroup[] = ['triassic', 'jurassic', 'cretaceous'];
export const DIET_GROUPS: DietGroup[] = ['carnivore', 'herbivore', 'omnivore'];
export const REGIONS: Region[] = [
  'north_america',
  'south_america',
  'europe',
  'asia',
  'africa',
  'australia',
  'antarctica',
];

/** Million years ago — start/end of each period, oldest first. */
export const PERIOD_RANGES: Record<PeriodGroup, [number, number]> = {
  triassic: [252, 201],
  jurassic: [201, 145],
  cretaceous: [145, 66],
};

const norm = (value: string | null | undefined) => (value ?? '').toLowerCase().trim();

/**
 * Maps a free-text period to its Mesozoic bucket. When a value spans two
 * periods ("Late Triassic–Early Jurassic") the first one mentioned wins.
 */
export function periodGroupOf(period: string | null | undefined): PeriodGroup | null {
  const p = norm(period);
  let best: { group: PeriodGroup; index: number } | null = null;
  for (const group of PERIOD_GROUPS) {
    const index = p.indexOf(group);
    if (index !== -1 && (!best || index < best.index)) best = { group, index };
  }
  return best?.group ?? null;
}

export function dietGroupOf(diet: string | null | undefined): DietGroup | null {
  const d = norm(diet);
  if (!d) return null;
  if (d.includes('omnivor')) return 'omnivore';
  if (d.includes('herbivor')) return 'herbivore';
  if (d.includes('carnivor') || d.includes('piscivor') || d.includes('insectivor')) return 'carnivore';
  return null;
}

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

interface Place {
  region: Region;
  /** Approximate centroid, [lat, lng]. */
  coords: [number, number];
}

/**
 * Keyword → place. Matching is case-insensitive and the longest keyword wins,
 * so "South Dakota" beats "Dakota" and "Inner Mongolia" beats "Mongolia".
 */
const PLACES: Record<string, Place> = {
  // North America — states / provinces first, they are the most precise.
  alaska: { region: 'north_america', coords: [64.2, -152.5] },
  alberta: { region: 'north_america', coords: [53.9, -116.6] },
  montana: { region: 'north_america', coords: [47.0, -109.6] },
  wyoming: { region: 'north_america', coords: [43.0, -107.5] },
  colorado: { region: 'north_america', coords: [39.5, -105.8] },
  utah: { region: 'north_america', coords: [39.3, -111.1] },
  'south dakota': { region: 'north_america', coords: [44.4, -100.2] },
  dakota: { region: 'north_america', coords: [47.5, -101.0] },
  texas: { region: 'north_america', coords: [31.0, -99.9] },
  'new mexico': { region: 'north_america', coords: [34.5, -106.0] },
  arizona: { region: 'north_america', coords: [34.0, -111.1] },
  california: { region: 'north_america', coords: [36.8, -119.4] },
  oklahoma: { region: 'north_america', coords: [35.5, -97.5] },
  kansas: { region: 'north_america', coords: [38.5, -98.0] },
  arkansas: { region: 'north_america', coords: [35.2, -92.4] },
  alabama: { region: 'north_america', coords: [32.8, -86.8] },
  maryland: { region: 'north_america', coords: [39.0, -76.6] },
  'new jersey': { region: 'north_america', coords: [40.1, -74.4] },
  washington: { region: 'north_america', coords: [38.9, -77.0] },
  'united states': { region: 'north_america', coords: [39.8, -98.6] },
  usa: { region: 'north_america', coords: [39.8, -98.6] },
  canada: { region: 'north_america', coords: [56.1, -106.3] },
  coahuila: { region: 'north_america', coords: [27.0, -102.0] },
  mexico: { region: 'north_america', coords: [23.6, -102.5] },
  'north america': { region: 'north_america', coords: [45.0, -100.0] },

  // South America
  patagonia: { region: 'south_america', coords: [-41.8, -68.9] },
  'neuquén': { region: 'south_america', coords: [-38.9, -69.9] },
  neuquen: { region: 'south_america', coords: [-38.9, -69.9] },
  argentina: { region: 'south_america', coords: [-34.6, -64.0] },
  'são paulo': { region: 'south_america', coords: [-22.0, -49.0] },
  'rio grande do sul': { region: 'south_america', coords: [-29.7, -53.7] },
  brazil: { region: 'south_america', coords: [-14.2, -51.9] },
  chile: { region: 'south_america', coords: [-30.0, -71.0] },
  colombia: { region: 'south_america', coords: [4.6, -74.1] },
  ecuador: { region: 'south_america', coords: [-1.8, -78.2] },
  venezuela: { region: 'south_america', coords: [6.4, -66.6] },
  'south america': { region: 'south_america', coords: [-15.0, -60.0] },

  // Europe
  'isle of wight': { region: 'europe', coords: [50.7, -1.3] },
  dorset: { region: 'europe', coords: [50.75, -2.3] },
  sussex: { region: 'europe', coords: [50.9, 0.1] },
  oxfordshire: { region: 'europe', coords: [51.8, -1.3] },
  wales: { region: 'europe', coords: [52.1, -3.8] },
  england: { region: 'europe', coords: [52.4, -1.5] },
  'united kingdom': { region: 'europe', coords: [54.0, -2.0] },
  uk: { region: 'europe', coords: [54.0, -2.0] },
  france: { region: 'europe', coords: [46.6, 2.2] },
  spain: { region: 'europe', coords: [40.4, -3.7] },
  teruel: { region: 'europe', coords: [40.3, -1.1] },
  portugal: { region: 'europe', coords: [39.6, -8.4] },
  iberia: { region: 'europe', coords: [40.0, -4.0] },
  germany: { region: 'europe', coords: [51.2, 10.4] },
  switzerland: { region: 'europe', coords: [46.8, 8.2] },
  austria: { region: 'europe', coords: [47.5, 14.6] },
  belgium: { region: 'europe', coords: [50.5, 4.5] },
  netherlands: { region: 'europe', coords: [52.1, 5.3] },
  denmark: { region: 'europe', coords: [56.3, 9.5] },
  norway: { region: 'europe', coords: [60.5, 8.5] },
  poland: { region: 'europe', coords: [51.9, 19.1] },
  'czech republic': { region: 'europe', coords: [49.8, 15.5] },
  hungary: { region: 'europe', coords: [47.2, 19.5] },
  romania: { region: 'europe', coords: [45.9, 24.9] },
  'hațeg': { region: 'europe', coords: [45.6, 22.9] },
  croatia: { region: 'europe', coords: [45.1, 15.2] },
  italy: { region: 'europe', coords: [41.9, 12.6] },
  ukraine: { region: 'europe', coords: [48.4, 31.2] },
  europe: { region: 'europe', coords: [50.0, 10.0] },

  // Asia
  'inner mongolia': { region: 'asia', coords: [41.5, 111.5] },
  gobi: { region: 'asia', coords: [43.5, 103.5] },
  mongolia: { region: 'asia', coords: [46.9, 103.8] },
  liaoning: { region: 'asia', coords: [41.3, 122.6] },
  sichuan: { region: 'asia', coords: [30.6, 102.7] },
  yunnan: { region: 'asia', coords: [25.0, 101.5] },
  xinjiang: { region: 'asia', coords: [42.5, 86.0] },
  gansu: { region: 'asia', coords: [37.8, 101.0] },
  henan: { region: 'asia', coords: [33.9, 113.5] },
  shandong: { region: 'asia', coords: [36.3, 118.2] },
  jiangxi: { region: 'asia', coords: [27.6, 115.7] },
  zhejiang: { region: 'asia', coords: [29.2, 120.1] },
  tibet: { region: 'asia', coords: [31.0, 88.0] },
  china: { region: 'asia', coords: [35.0, 105.0] },
  japan: { region: 'asia', coords: [36.2, 138.3] },
  korea: { region: 'asia', coords: [36.5, 127.9] },
  india: { region: 'asia', coords: [21.0, 78.0] },
  pakistan: { region: 'asia', coords: [29.0, 69.3] },
  balochistan: { region: 'asia', coords: [28.5, 65.5] },
  thailand: { region: 'asia', coords: [15.9, 101.0] },
  laos: { region: 'asia', coords: [19.9, 102.5] },
  russia: { region: 'asia', coords: [52.0, 110.0] },
  kazakhstan: { region: 'asia', coords: [48.0, 66.9] },
  uzbekistan: { region: 'asia', coords: [41.4, 64.6] },
  kyrgyzstan: { region: 'asia', coords: [41.2, 74.8] },
  asia: { region: 'asia', coords: [40.0, 95.0] },

  // Africa
  'south africa': { region: 'africa', coords: [-30.6, 22.9] },
  morocco: { region: 'africa', coords: [31.8, -7.1] },
  egypt: { region: 'africa', coords: [26.8, 30.8] },
  niger: { region: 'africa', coords: [17.6, 8.1] },
  tanzania: { region: 'africa', coords: [-6.4, 34.9] },
  madagascar: { region: 'africa', coords: [-18.8, 46.9] },
  algeria: { region: 'africa', coords: [28.0, 1.7] },
  tunisia: { region: 'africa', coords: [33.9, 9.5] },
  angola: { region: 'africa', coords: [-11.2, 17.9] },
  zimbabwe: { region: 'africa', coords: [-19.0, 29.2] },
  zambia: { region: 'africa', coords: [-13.1, 27.8] },
  malawi: { region: 'africa', coords: [-13.3, 34.3] },
  lesotho: { region: 'africa', coords: [-29.6, 28.2] },
  mali: { region: 'africa', coords: [17.6, -4.0] },
  chad: { region: 'africa', coords: [15.5, 18.7] },
  africa: { region: 'africa', coords: [5.0, 20.0] },

  // Oceania
  queensland: { region: 'australia', coords: [-22.6, 144.1] },
  'new south wales': { region: 'australia', coords: [-32.0, 147.0] },
  victoria: { region: 'australia', coords: [-37.0, 144.5] },
  'western australia': { region: 'australia', coords: [-25.0, 122.0] },
  australia: { region: 'australia', coords: [-25.3, 133.8] },
  oceania: { region: 'australia', coords: [-25.3, 133.8] },

  // Antarctica
  antarctica: { region: 'antarctica', coords: [-80.0, 0.0] },
  'james ross island': { region: 'antarctica', coords: [-64.2, -57.7] },
  'mount kirkpatrick': { region: 'antarctica', coords: [-84.3, 166.3] },
};

const PLACE_KEYS = Object.keys(PLACES).sort((a, b) => b.length - a.length);

/** Words like "uk" or "usa" must match on boundaries, not inside "ukraine". */
const keyPatterns = new Map(
  PLACE_KEYS.map((key) => [key, new RegExp(`(^|[^a-zà-ÿ])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-zà-ÿ])`, 'i')]),
);

function findPlace(text: string | null | undefined): Place | null {
  const t = norm(text);
  if (!t) return null;
  for (const key of PLACE_KEYS) {
    if (keyPatterns.get(key)!.test(t)) return PLACES[key];
  }
  return null;
}

/** Continent-level region, preferring the explicit `lived_in` column. */
export function regionOf(livedIn: string | null | undefined, fossilLocation?: string | null): Region | null {
  return findPlace(livedIn)?.region ?? findPlace(fossilLocation)?.region ?? null;
}

/**
 * Approximate map position. `fossil_location` is the most precise column,
 * `lived_in` is the fallback. Returns null when nothing is recognisable.
 */
export function coordinatesOf(
  fossilLocation: string | null | undefined,
  livedIn?: string | null,
): [number, number] | null {
  return (findPlace(fossilLocation) ?? findPlace(livedIn))?.coords ?? null;
}

/**
 * Deterministic jitter so specimens from the same country don't stack on a
 * single pixel, and so markers stay put between renders.
 */
export function jitter(coords: [number, number], seed: string, spreadDeg = 2.5): [number, number] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = ((h >>> 0) % 10000) / 10000;
  const b = (((h >>> 0) / 10000) % 10000) / 10000;
  return [coords[0] + (a - 0.5) * spreadDeg, coords[1] + (b - 0.5) * spreadDeg];
}

/* ------------------------------------------------------------------ */
/* Morphological categories (used by the map legend)                   */
/* ------------------------------------------------------------------ */

export type Clade = 'theropod' | 'sauropod' | 'armored' | 'ornithopod' | 'other';
export const CLADES: Clade[] = ['theropod', 'sauropod', 'armored', 'ornithopod', 'other'];

interface CladeSource {
  common_name?: string | null;
  scientific_name?: string | null;
  behavior_notes?: string | null;
  notable_features?: string | null;
  diet?: string | null;
  locomotion?: string | null;
}

const ARMORED = /ankylos|stegosaur|nodosaur|ceratops|tricerat|armou?r|plates|osteoderm|horn|frill|club/;
const SAUROPOD = /sauropod|titanosaur|long[- ]neck|brachiosaur|diplodoc|apatosaur|camarasaur/;
const ORNITHOPOD = /hadrosaur|duck[- ]bill|iguanodon|ornithopod|crest/;
const THEROPOD = /theropod|tyrannosaur|raptor|dromaeosaur|abelisaur|allosaur|spinosaur|predator/;

export function cladeOf(d: CladeSource): Clade {
  const text = norm(
    [d.common_name, d.scientific_name, d.behavior_notes, d.notable_features].filter(Boolean).join(' '),
  );
  if (ARMORED.test(text)) return 'armored';
  if (SAUROPOD.test(text)) return 'sauropod';
  if (ORNITHOPOD.test(text)) return 'ornithopod';
  if (THEROPOD.test(text) || dietGroupOf(d.diet) === 'carnivore') return 'theropod';
  if (dietGroupOf(d.diet) === 'herbivore' && norm(d.locomotion).startsWith('quadrupedal')) return 'sauropod';
  return 'other';
}
