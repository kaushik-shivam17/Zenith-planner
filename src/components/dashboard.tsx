'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Clock } from '@/components/clock';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/task-form';
import { useTasks } from '@/hooks/use-tasks';

export function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { addTask } = useTasks();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setIsAddOpen(true);
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'deadline'>) => {
    if (date) {
      addTask({ ...taskData, deadline: date });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Clock />
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Welcome to Zenith Planner
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          Select a date on the calendar to quickly add a new task or choose a tool from the sidebar.
        </p>
      </div>
      <div className="rounded-md border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="p-0"
          classNames={{
            root: 'w-full',
            months: 'w-full',
            month: 'w-full',
            table: 'w-full',
            head_row: 'grid grid-cols-7',
            row: 'grid grid-cols-7',
            day: 'h-16 w-full',
            day_selected:
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          }}
        />
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log a New Task for {date ? format(date, 'PPP') : ''}</DialogTitle>
            <DialogDescription>
              Input the details for a new task objective. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onAddTask={handleAddTask} selectedDate={date} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
