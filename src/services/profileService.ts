import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firestoreService';

export type ProfileDoc = {
  user_id: string;
  display_name?: string | null;
  bio?: string | null;
  organization?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
  quiz_scores?: {
    latest_score?: number;
    total_quizzes?: number;
    best_score?: number;
    last_quiz_date?: string;
  } | null;
};

export async function getOrCreateProfile(uid: string, defaults?: Partial<ProfileDoc>) {
  const ref = doc(db(), 'profiles', uid);
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

export async function updateProfile(uid: string, patch: Partial<ProfileDoc>) {
  const ref = doc(db(), 'profiles', uid);
  await updateDoc(ref, { ...patch, updated_at: new Date().toISOString() });
}
