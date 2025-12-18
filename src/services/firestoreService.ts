import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/integrations/firebase/firestore';

// Small helpers so the rest of the code stays clean.
export const db = () => getFirebaseFirestore();

export async function getDocData<T = DocumentData>(path: string): Promise<T | null> {
  const snap = await getDoc(doc(db(), path));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function setDocData<T extends DocumentData>(path: string, data: T) {
  await setDoc(doc(db(), path), data, { merge: true });
}

export async function updateDocData(path: string, data: Record<string, unknown>) {
  await updateDoc(doc(db(), path), data);
}

export function col(name: string) {
  return collection(db(), name);
}

export { query, where, orderBy, limit, getDocs };
