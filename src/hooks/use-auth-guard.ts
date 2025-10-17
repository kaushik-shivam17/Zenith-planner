
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAuthGuard(isProtectedRoute: boolean) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the initial loading is complete
    if (isUserLoading) {
      return;
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // If it's a protected route and the user is not logged in, redirect to login
    if (isProtectedRoute && !user) {
      router.replace('/login');
    }
    
    // If the user is logged in and trying to access a login/signup page, redirect to dashboard
    if (user && isAuthPage) {
      router.replace('/dashboard');
    }

  }, [user, isUserLoading, isProtectedRoute, router, pathname]);

  return { user, isUserLoading };
}
