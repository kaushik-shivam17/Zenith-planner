'use client';

import { BlinkProvider } from '@blinkdotnew/react';
import { DataProvider } from '@/context/data-provider';
import { AppShell } from '@/components/app-shell';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BlinkProvider projectId={process.env.NEXT_PUBLIC_BLINK_PROJECT_ID as string}>
      <DataProvider>
        <AppShell>{children}</AppShell>
      </DataProvider>
    </BlinkProvider>
  );
}
