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
  if (firebaseServices) {
    return firebaseServices;
  }

  // Guard against missing API key.
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase API key is missing. Please add your Firebase project config to .env.local'
    );
    // Return null services if config is invalid to prevent crash.
    return { firebaseApp: null, auth: null, firestore: null };
  }

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
