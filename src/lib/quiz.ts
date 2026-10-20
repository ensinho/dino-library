/** Seconds allowed per question. */
export const QUESTION_TIME = 30;

/** Unbiased Fisher–Yates shuffle (`sort(() => Math.random() - 0.5)` is not uniform). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Bonus points for one answer. Bonuses only count towards the arcade-style
 * point total — the saved percentage is always correct answers / questions.
 */
export function pointsFor(correct: boolean, secondsLeft: number, streak: number) {
  if (!correct) return { speed: 0, streakBonus: 0 };
  const speed = secondsLeft > 20 ? 50 : secondsLeft > 10 ? 25 : 0;
  const streakBonus = streak >= 3 ? streak * 10 : 0;
  return { speed, streakBonus };
}
