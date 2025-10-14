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
