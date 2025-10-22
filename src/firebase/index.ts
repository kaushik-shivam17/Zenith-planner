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

  // Guard against missing API key, which is a reliable indicator of missing config.
  if (!firebaseConfig.apiKey) {
    // Throw an error that can be caught by a boundary or provider
    throw new Error(
      'Firebase configuration is missing or incomplete. Please add your Firebase project config to your Vercel/Next.js environment variables and ensure they are prefixed with NEXT_PUBLIC_.'
    );
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseServices = {
    firebaseApp: app,
    auth: auth,
    firestore: firestore,
  };
  
  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
