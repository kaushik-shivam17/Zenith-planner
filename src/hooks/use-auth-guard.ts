'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAuthGuard(isProtectedRoute: boolean) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      if (isProtectedRoute && !user) {
        // If it's a protected route and the user is not logged in, redirect to login
        router.replace('/login');
      } else if (user && (pathname === '/login' || pathname === '/signup')) {
        // If user is logged in and on a login/signup page, redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [user, isUserLoading, isProtectedRoute, router, pathname]);

  return { user, isUserLoading };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // The useAuthGuard hook is now applied within AppShell, which determines if a route is protected.
    // This provider remains as a structural element for wrapping the app, but redirection logic
    // is centralized in the component that uses the useAuthGuard hook.
    return <>{children}</>;
}
