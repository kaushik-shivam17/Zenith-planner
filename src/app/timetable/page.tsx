'use client';

import { useContext } from 'react';
import { Timetable as TimetableComponent } from '@/components/timetable';
import { Loader2 } from 'lucide-react';
import { DataContext } from '@/context/data-provider';


export default function TimetablePage() {
  const { 
    events, 
    setEvents, 
    addCustomEvents, 
    deleteCustomEvent, 
    clearEvents, 
    tasks, 
    isLoading 
  } = useContext(DataContext);
  
  
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
