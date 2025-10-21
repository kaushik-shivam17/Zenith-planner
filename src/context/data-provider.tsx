'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks, type TasksHook } from '@/hooks/use-tasks';
import { useMissions, type MissionsHook } from '@/hooks/use-missions';
import { useTimetable, type TimetableHook } from '@/hooks/use-timetable';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

// This combines all our data hooks into one unified context type
type DataContextType = TasksHook & MissionsHook & TimetableHook & {
    isLoading: boolean;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // These hooks will now only fetch if the user is logged in.
  // The hooks themselves are lightweight and won't fetch until a user is present.
  const tasksHook = useTasks();
  const missionsHook = useMissions();
  const timetableHook = useTimetable();

  // Overall loading state: true if...
  // 1. We are still checking the user's auth state.
  // 2. The user is logged in, but one of the data hooks is still loading its initial data.
  const isLoading = isUserLoading || (!!user && (tasksHook.isLoading || missionsHook.isLoading || timetableHook.isLoading));
  
  const value: DataContextType = {
    ...tasksHook,
    ...missionsHook,
    ...timetableHook,
    isLoading,
  };
  
  // If we are on a protected route and still loading crucial auth/data, show a loading screen.
  // This prevents rendering components with incomplete or no data.
  if (isLoading && !isAuthPage) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Your Workspace...</span>
        </div>
      </div>
    );
  }

  // Once loading is complete OR if we are on a public auth page, render the children.
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
