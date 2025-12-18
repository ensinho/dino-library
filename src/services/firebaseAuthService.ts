import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/integrations/firebase/auth';

export type AuthUser = User;

export function listenToAuthChanges(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return getFirebaseAuth().currentUser;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

export async function signOutUser() {
  await signOut(getFirebaseAuth());
}
