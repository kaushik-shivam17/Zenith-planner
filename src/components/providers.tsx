'use client';

import { DataProvider } from '@/context/data-provider';
import { AppShell } from '@/components/app-shell';
import { ReactNode, Suspense } from 'react';
import { RouteProgress, ScrollToTop } from '@/components/route-progress';
import { CommandPalette } from '@/components/command-palette';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { GlobalKeyboardNav } from '@/components/global-keyboard-nav';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <Suspense fallback={null}>
        <RouteProgress />
        <ScrollToTop />
        <GlobalKeyboardNav />
      </Suspense>
      <AppShell>{children}</AppShell>
      <CommandPalette />
      <MobileBottomNav />
    </DataProvider>
  );
}
