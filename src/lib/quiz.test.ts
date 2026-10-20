import { describe, expect, it } from 'vitest';
import { pointsFor, shuffle } from './quiz';

describe('shuffle', () => {
  it('keeps every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('is driven by the injected random source', () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});

describe('pointsFor', () => {
  it('gives nothing for a wrong answer', () => {
    expect(pointsFor(false, 29, 5)).toEqual({ speed: 0, streakBonus: 0 });
  });

  it('rewards speed and streaks', () => {
    expect(pointsFor(true, 25, 1)).toEqual({ speed: 50, streakBonus: 0 });
    expect(pointsFor(true, 15, 3)).toEqual({ speed: 25, streakBonus: 30 });
    expect(pointsFor(true, 5, 2)).toEqual({ speed: 0, streakBonus: 0 });
  });
});
