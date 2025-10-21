'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAuthGuard(isProtectedRoute: boolean) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is resolved
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isProtectedRoute && !user) {
      // If it's a protected route and user is not logged in, redirect to login.
      router.replace('/login');
    } else if (user && isAuthPage) {
      // If user is logged in and tries to access login/signup, redirect to dashboard.
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, isProtectedRoute, router, pathname]);

  return { user, isUserLoading };
}
