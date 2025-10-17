
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

function AuthLoadingGate({ children }: { children: ReactNode }) {
  const { isUserLoading } = useUser();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  // Show loading screen only on protected routes
  const isProtectedRoute = !isAuthPage;

  if (isUserLoading && isProtectedRoute) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthLoadingGate>{children}</AuthLoadingGate>
    </FirebaseProvider>
  );
}
