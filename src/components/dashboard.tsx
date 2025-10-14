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
import { Card, CardContent } from '@/components/ui/card';

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

      <Card
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => handleDateSelect(new Date())}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
          <div className="text-2xl font-semibold text-muted-foreground">
            {date ? format(date, 'eeee') : ''}
          </div>
          <div className="text-7xl font-bold text-primary">
            {date ? format(date, 'd') : ''}
          </div>
          <div className="text-2xl font-semibold text-muted-foreground">
            {date ? format(date, 'MMMM yyyy') : ''}
          </div>
        </CardContent>
      </Card>


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
