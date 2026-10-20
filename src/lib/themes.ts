import type { DinosaurSpecies } from '@/services/dinosaurService';
import { dietGroupOf } from '@/lib/taxonomy';

/**
 * Curated themes shown on /discover. Each theme is a predicate plus an
 * optional ordering, so the same definition powers both the eight-card
 * preview on Discover and the full `/catalog?theme=<id>` listing.
 */
export type ThemeId = 'giants' | 'predators' | 'brazil' | 'armored' | 'rare' | 'aerial';

export interface Theme {
  id: ThemeId;
  matches: (d: DinosaurSpecies) => boolean;
  sort?: (a: DinosaurSpecies, b: DinosaurSpecies) => number;
}

const text = (...values: (string | null | undefined)[]) => values.filter(Boolean).join(' ').toLowerCase();

export const THEMES: Theme[] = [
  {
    id: 'giants',
    matches: (d) => (d.length_m ?? 0) >= 15,
    sort: (a, b) => (b.length_m ?? 0) - (a.length_m ?? 0),
  },
  {
    id: 'predators',
    matches: (d) =>
      dietGroupOf(d.diet) === 'carnivore' && (d.length_m ?? 0) >= 6,
    sort: (a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0),
  },
  {
    id: 'brazil',
    matches: (d) => text(d.lived_in, d.fossil_location).includes('brazil'),
  },
  {
    id: 'armored',
    matches: (d) => /armou?r|spike|plate|horn|osteoderm|club|frill/.test(text(d.notable_features, d.behavior_notes)),
  },
  {
    id: 'rare',
    matches: (d) => Number.parseInt(d.first_discovered ?? '', 10) >= 2015,
    sort: (a, b) => Number.parseInt(b.first_discovered ?? '0', 10) - Number.parseInt(a.first_discovered ?? '0', 10),
  },
  {
    id: 'aerial',
    matches: (d) => /feather|wing|glid|fly|flight/.test(text(d.notable_features, d.behavior_notes, d.locomotion)),
  },
];

export const isThemeId = (value: string | null | undefined): value is ThemeId =>
  THEMES.some((t) => t.id === value);

export function applyTheme(items: DinosaurSpecies[], id: ThemeId): DinosaurSpecies[] {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return items;
  const matched = items.filter(theme.matches);
  return theme.sort ? matched.sort(theme.sort) : matched;
}
