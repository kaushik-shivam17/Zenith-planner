'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // This non-blocking approach can lead to race conditions.
  // It is recommended to use the standard `await createUserWithEmailAndPassword(...)` instead.
  throw new Error('initiateEmailSignUp is deprecated due to race conditions. Use `await createUserWithEmailAndPassword` instead.');
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // This non-blocking approach can lead to race conditions.
  // It is recommended to use the standard `await signInWithEmailAndPassword(...)` instead.
  throw new Error('initiateEmailSignIn is deprecated due to race conditions. Use `await signInWithEmailAndPassword` instead.');
}
