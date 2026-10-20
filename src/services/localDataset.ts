import type { DinosaurSpecies } from '@/services/dinosaurService';

/**
 * Offline fallback: the same Kaggle CSV that seeds Firestore, bundled as a
 * lazily-loaded chunk. Used when Firebase isn't configured (fresh clones,
 * previews) or when `VITE_USE_LOCAL_SERVICES=true`.
 */
export async function loadLocalDataset(): Promise<DinosaurSpecies[]> {
  const [{ default: csv }, { parse }] = await Promise.all([
    import('../../scripts/data/dinosaur_genera.csv?raw'),
    import('csv-parse/browser/esm/sync'),
  ]);

  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const text = (v: string | undefined) => (v && v !== '?' ? v : null);
  const num = (v: string | undefined) => {
    const n = Number.parseFloat(v ?? '');
    return Number.isFinite(n) ? n : null;
  };

  return rows.map((r) => ({
    row_index: r.row_index,
    scientific_name: text(r.scientific_name),
    common_name: text(r.common_name),
    meaning: text(r.meaning),
    diet: text(r.diet),
    length_m: num(r.length_m),
    weight_kg: num(r.weight_kg),
    height_m: num(r.height_m),
    locomotion: text(r.locomotion),
    geological_period: text(r.geological_period),
    lived_in: text(r.lived_in),
    behavior_notes: text(r.behavior_notes),
    first_discovered: text(r.first_discovered),
    fossil_location: text(r.fossil_location),
    notable_features: text(r.notable_features),
    intelligence_level: text(r.intelligence_level),
    source_link: text(r.source_link),
    image_url: null,
  }));
}
