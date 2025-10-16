'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This structure will hold the initialized services.
let firebaseServices: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;

// This function initializes Firebase and returns the SDKs.
// It ensures that initialization only happens once.
export function initializeFirebase() {
  if (!firebaseServices) {
    let app;
    if (!getApps().length) {
      // If no app is initialized, initialize one.
      try {
        // First, try to initialize with App Hosting's automatic configuration.
        app = initializeApp();
      } catch (e) {
        // If that fails, fall back to the explicit config (for local dev).
        if (process.env.NODE_ENV === "production") {
          console.warn('Automatic Firebase initialization failed. Falling back to firebaseConfig.', e);
        }
        app = initializeApp(firebaseConfig);
      }
    } else {
      // If apps are already initialized, get the default one.
      app = getApp();
    }

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
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';