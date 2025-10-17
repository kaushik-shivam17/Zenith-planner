'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks, type TasksHook } from '@/hooks/use-tasks';
import { useMissions, type MissionsHook } from '@/hooks/use-missions';
import { useTimetable, type TimetableHook } from '@/hooks/use-timetable';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useGoals, type GoalsHook } from '@/hooks/use-goals';

// This combines all the individual hooks into one context type.
// We add 'isLoading' as a combined loading state.
// Note: useGoals is not included directly as it's mission-specific.
type DataContextType = TasksHook & MissionsHook & TimetableHook & {
    isLoading: boolean;
};

// Create the context with a default value.
export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();

  // These hooks will fetch data when the user logs in.
  const tasksHook = useTasks();
  const missionsHook = useMissions();
  const timetableHook = useTimetable();

  // Combine the loading states from all hooks.
  const isLoading = isUserLoading || (!!user && (tasksHook.isLoading || missionsHook.isLoading || timetableHook.isLoading));

  // The value provided to the context consumers.
  const value: DataContextType = {
    ...tasksHook,
    ...missionsHook,
    ...timetableHook,
    isLoading,
  };
  
  // While the initial data is loading after login, show a full-screen loader.
  // This prevents the UI from showing empty states briefly.
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

  // Once loaded, provide the data to the rest of the app.
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to easily consume the context in other components.
export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
