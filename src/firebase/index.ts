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
    console.error(
      'Firebase configuration is missing or incomplete. Please add your Firebase project config to the .env file and ensure they are prefixed with NEXT_PUBLIC_.'
    );
    // Return null services if config is invalid to prevent crash.
    // The provider will handle the nulls and show an appropriate state.
    // We cast to any to satisfy the return type.
    return { firebaseApp: null, auth: null, firestore: null } as any;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  firebaseServices = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
  
  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';