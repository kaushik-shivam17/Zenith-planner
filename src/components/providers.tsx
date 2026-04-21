'use client';

import { DataProvider } from '@/context/data-provider';
import { AppShell } from '@/components/app-shell';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <AppShell>{children}</AppShell>
    </DataProvider>
  );
}
