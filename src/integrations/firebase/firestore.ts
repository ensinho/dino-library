import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './client';

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}
