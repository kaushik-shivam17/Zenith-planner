'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This structure will hold the initialized services.
let firebaseServices: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;

/**
 * Initializes Firebase and returns the SDK services.
 * This function ensures that Firebase is initialized only once.
 */
export function initializeFirebase() {
  if (!firebaseServices) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }
  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';