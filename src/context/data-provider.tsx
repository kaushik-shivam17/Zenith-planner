
'use client';

import { createContext, type ReactNode } from 'react';
import { useTasks, type TasksHook } from '@/hooks/use-tasks';
import { useMissions, type MissionsHook } from '@/hooks/use-missions';
import { useTimetable, type TimetableHook } from '@/hooks/use-timetable';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

type DataContextType = TasksHook & MissionsHook & TimetableHook & {
    isLoading: boolean;
};

export const DataContext = createContext<DataContextType>({
  tasks: [],
  getTaskById: () => undefined,
  addTask: async () => {},
  updateTask: async () => {},
  toggleTaskCompletion: async () => {},
  missions: [],
  getMissionById: () => undefined,
  addMission: async () => {},
  updateMission: async () => {},
  deleteMission: async () => {},
  events: [],
  setEvents: async () => {},
  addCustomEvents: async () => {},
  deleteCustomEvent: async () => {},
  clearEvents: async () => {},
  isLoading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();

  const tasksHook = useTasks();
  const missionsHook = useMissions();
  const timetableHook = useTimetable();

  const isLoading = isUserLoading || (!!user && (tasksHook.isLoading || missionsHook.isLoading || timetableHook.isLoading));

  const value: DataContextType = {
    ...tasksHook,
    ...missionsHook,
    ...timetableHook,
    isLoading,
  };
  
  // Render a loading state if the user is loading or if the user is set and any of the hooks are loading
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
