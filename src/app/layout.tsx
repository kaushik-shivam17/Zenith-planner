import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { TasksProvider } from '@/hooks/use-tasks';
import { MissionsProvider } from '@/hooks/use-missions';
import { TimetableProvider } from '@/hooks/use-timetable';
import { FirebaseClientProvider } from '@/firebase';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Zenith Planner',
  description: 'Your AI-powered study and task manager.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <TimetableProvider>
            <MissionsProvider>
              <TasksProvider>
                <AppShell>{children}</AppShell>
              </TasksProvider>
            </MissionsProvider>
          </TimetableProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
