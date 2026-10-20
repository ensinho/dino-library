import { arrayRemove, arrayUnion, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from './firestoreService';

export type QuizScores = {
  latest_score?: number;
  total_quizzes?: number;
  best_score?: number;
  average_score?: number;
  last_quiz_date?: string;
};

export type ProfileDoc = {
  user_id: string;
  display_name?: string | null;
  bio?: string | null;
  organization?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
  quiz_scores?: QuizScores | null;
  favorites?: string[];
};

const profileRef = (uid: string) => doc(db(), 'profiles', uid);

export async function getOrCreateProfile(uid: string, defaults?: Partial<ProfileDoc>) {
  const ref = profileRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as ProfileDoc;

  const now = new Date().toISOString();
  const docData: ProfileDoc = {
    user_id: uid,
    created_at: now,
    updated_at: now,
    ...defaults,
  };
  await setDoc(ref, docData, { merge: true });
  return docData;
}

/** Merge-writes so it works even before the profile document exists. */
export async function updateProfile(uid: string, patch: Partial<ProfileDoc>) {
  await setDoc(
    profileRef(uid),
    { user_id: uid, ...patch, updated_at: new Date().toISOString() },
    { merge: true },
  );
}

/**
 * Folds one quiz result into the running totals atomically, so two tabs
 * finishing a quiz at the same time can't clobber each other.
 */
export async function recordQuizResult(uid: string, percentage: number): Promise<QuizScores> {
  const ref = profileRef(uid);
  return runTransaction(db(), async (tx) => {
    const snap = await tx.get(ref);
    const prev = (snap.exists() ? (snap.data() as ProfileDoc).quiz_scores : null) ?? {};
    const total = (prev.total_quizzes ?? 0) + 1;
    const now = new Date().toISOString();
    const next: QuizScores = {
      latest_score: percentage,
      best_score: Math.max(prev.best_score ?? 0, percentage),
      total_quizzes: total,
      average_score: Math.round(((prev.average_score ?? 0) * (total - 1) + percentage) / total),
      last_quiz_date: now,
    };
    tx.set(ref, { user_id: uid, quiz_scores: next, updated_at: now }, { merge: true });
    return next;
  });
}

export async function setFavorite(uid: string, speciesId: string, favorite: boolean) {
  await setDoc(
    profileRef(uid),
    { user_id: uid, favorites: favorite ? arrayUnion(speciesId) : arrayRemove(speciesId) },
    { merge: true },
  );
}

export async function mergeFavorites(uid: string, speciesIds: string[]) {
  if (!speciesIds.length) return;
  await setDoc(profileRef(uid), { user_id: uid, favorites: arrayUnion(...speciesIds) }, { merge: true });
}
