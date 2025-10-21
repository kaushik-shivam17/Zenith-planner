
'use client';

import React, { useMemo, useState, type ReactNode } from 'react';
import { FirebaseProvider, AuthLoadingGate } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { AlertTriangle } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [initError, setInitError] = useState<string | null>(null);

  const firebaseServices = useMemo(() => {
    try {
      // Initialize Firebase on the client side, once per component mount.
      return initializeFirebase();
    } catch (error: any) {
      setInitError(error.message);
      return null;
    }
  }, []);

  if (initError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-lg border border-destructive bg-card p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold text-destructive">Firebase Not Configured</h1>
          <p className="mt-2 text-muted-foreground">
            The application could not connect to Firebase. This is likely because the required environment variables are missing.
          </p>
          <div className="mt-4 rounded-md bg-secondary p-4 text-left text-sm text-foreground">
            <h2 className="font-semibold">Action Required:</h2>
            <p className="mt-2">
              Please add your Firebase project configuration as environment variables in your Vercel project settings. Ensure all variables are prefixed with <code className="font-mono bg-muted px-1 py-0.5 rounded-sm">NEXT_PUBLIC_</code>.
            </p>
            <p className="mt-2">Example: <code className="font-mono bg-muted px-1 py-0.5 rounded-sm">NEXT_PUBLIC_FIREBASE_API_KEY=...</code></p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{initError}</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp ?? null}
      auth={firebaseServices?.auth ?? null}
      firestore={firebaseServices?.firestore ?? null}
    >
      <AuthLoadingGate>{children}</AuthLoadingGate>
      <FirebaseErrorListener />
    </FirebaseProvider>
  );
}
