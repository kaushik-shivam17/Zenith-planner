'use client';

import { DataProvider } from '@/context/data-provider';
import { AppShell } from '@/components/app-shell';
import { ReactNode, Suspense } from 'react';
import { RouteProgress, ScrollToTop } from '@/components/route-progress';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <Suspense fallback={null}>
        <RouteProgress />
        <ScrollToTop />
      </Suspense>
      <AppShell>{children}</AppShell>
    </DataProvider>
  );
}
