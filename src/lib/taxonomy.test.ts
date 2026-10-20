import { describe, expect, it } from 'vitest';
import { cladeOf, coordinatesOf, dietGroupOf, jitter, periodGroupOf, regionOf } from './taxonomy';

describe('periodGroupOf', () => {
  it.each([
    ['Late Cretaceous (Campanian)', 'cretaceous'],
    ['Early Jurassic', 'jurassic'],
    ['Triassic (Norian)', 'triassic'],
    ['Late Triassic–Early Jurassic', 'triassic'],
    ['Jurassic or Cretaceous (disputed)', 'jurassic'],
  ])('%s → %s', (input, expected) => {
    expect(periodGroupOf(input)).toBe(expected);
  });

  it('returns null for unknown values', () => {
    expect(periodGroupOf('?')).toBeNull();
    expect(periodGroupOf(null)).toBeNull();
  });
});

describe('dietGroupOf', () => {
  it('normalises qualifiers', () => {
    expect(dietGroupOf('Carnivore (disputed)')).toBe('carnivore');
    expect(dietGroupOf('Possibly carnivore')).toBe('carnivore');
    expect(dietGroupOf('Tiny herbivore')).toBe('herbivore');
    expect(dietGroupOf('Omnivore')).toBe('omnivore');
    expect(dietGroupOf('Unknown')).toBeNull();
  });
});

describe('regionOf', () => {
  it('maps continents and countries', () => {
    expect(regionOf('North America (Utah, USA)')).toBe('north_america');
    expect(regionOf('Argentina')).toBe('south_america');
    expect(regionOf('Asia (China)')).toBe('asia');
    expect(regionOf('South Africa')).toBe('africa');
    expect(regionOf('Oceania (Australia)')).toBe('australia');
  });

  it('falls back to the fossil location', () => {
    expect(regionOf('Unknown', 'Tendaguru Formation, Tanzania')).toBe('africa');
  });

  it('does not match short keys inside longer words', () => {
    expect(regionOf('Ukraine')).toBe('europe');
    expect(regionOf('Ukraine')).not.toBeNull();
  });
});

describe('coordinatesOf', () => {
  it('prefers the most specific keyword', () => {
    expect(coordinatesOf('Hell Creek Formation, South Dakota')).toEqual(coordinatesOf('South Dakota'));
    expect(coordinatesOf('Inner Mongolia, China')).not.toEqual(coordinatesOf('Mongolia'));
    expect(coordinatesOf('New Mexico, USA')).not.toEqual(coordinatesOf('Mexico'));
  });

  it('returns null when nothing is recognisable', () => {
    expect(coordinatesOf('Unknown', '?')).toBeNull();
  });
});

describe('jitter', () => {
  it('is deterministic and bounded', () => {
    const base: [number, number] = [10, 20];
    const a = jitter(base, '42');
    expect(jitter(base, '42')).toEqual(a);
    expect(Math.abs(a[0] - 10)).toBeLessThanOrEqual(1.25);
    expect(Math.abs(a[1] - 20)).toBeLessThanOrEqual(1.25);
    expect(jitter(base, '43')).not.toEqual(a);
  });
});

describe('cladeOf', () => {
  it('recognises the main groups', () => {
    expect(cladeOf({ common_name: 'Tyrannosaurus', diet: 'Carnivore', behavior_notes: 'Large theropod' })).toBe('theropod');
    expect(cladeOf({ common_name: 'Ankylosaurus', notable_features: 'Tail club' })).toBe('armored');
    expect(cladeOf({ common_name: 'Brachiosaurus', behavior_notes: 'Long-necked sauropod' })).toBe('sauropod');
    expect(cladeOf({ common_name: 'Parasaurolophus', behavior_notes: 'Hadrosaur with crest' })).toBe('ornithopod');
  });
});
