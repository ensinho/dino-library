import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from './client';

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
