'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks, type TasksHook } from '@/hooks/use-tasks';
import { useMissions, type MissionsHook } from '@/hooks/use-missions';
import { useTimetable, type TimetableHook } from '@/hooks/use-timetable';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

type DataContextType = TasksHook & MissionsHook & TimetableHook & {
    isLoading: boolean;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();

  // These hooks will now only fetch if the user is logged in.
  const tasksHook = useTasks();
  const missionsHook = useMissions();
  const timetableHook = useTimetable();

  // Combine loading states: true if user is loading OR if user is logged in and any data hook is still loading.
  const isLoading = isUserLoading || (!!user && (tasksHook.isLoading || missionsHook.isLoading || timetableHook.isLoading));
  
  const value: DataContextType = {
    ...tasksHook,
    ...missionsHook,
    ...timetableHook,
    isLoading,
  };
  
  if (isLoading && user) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Your Workspace...</span>
        </div>
      </div>
    );
  }

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
