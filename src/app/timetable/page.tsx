'use client';

import { Timetable as TimetableComponent } from '@/components/timetable';
import { useTimetable } from '@/hooks/use-timetable';
import { useTasks } from '@/hooks/use-tasks';
import { Loader2 } from 'lucide-react';


export default function TimetablePage() {
  const { events, setEvents, addCustomEvents, deleteCustomEvent, clearEvents, isLoading: isTimetableLoading } = useTimetable();
  const { tasks, isLoading: areTasksLoading } = useTasks();
  
  const isLoading = isTimetableLoading || areTasksLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <TimetableComponent 
    events={events}
    tasks={tasks}
    setEvents={setEvents}
    addCustomEvents={addCustomEvents}
    deleteCustomEvent={deleteCustomEvent}
    clearEvents={clearEvents}
  />;
}
