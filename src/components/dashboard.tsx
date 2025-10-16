
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import { Button } from './ui/button';

export function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDateForTask, setSelectedDateForTask] = useState<Date | undefined>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { addTask } = useTasks();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setSelectedDateForTask(selectedDate);
      setIsCalendarOpen(false);
      setIsAddOpen(true);
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'userId'>) => {
    addTask(taskData);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Clock />
      </div>

      <Card
        className="cursor-pointer hover:bg-secondary/50 transition-colors relative group"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsCalendarOpen(true);
          }}
        >
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Open Calendar</span>
        </Button>
        <CardContent 
          className="p-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleDateSelect(new Date())}
        >
          <div className="text-xl md:text-2xl font-semibold text-muted-foreground">
            {date ? format(date, 'eeee') : ''}
          </div>
          <div className="text-6xl md:text-7xl font-bold text-primary">
            {date ? format(date, 'd') : ''}
          </div>
          <div className="text-xl md:text-2xl font-semibold text-muted-foreground">
            {date ? format(date, 'MMMM yyyy') : ''}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
          Welcome to Zenith Planner
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Select a date on the calendar to quickly add a new task or choose a tool from the sidebar.
        </p>
      </div>

      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="sm:max-w-auto p-0 w-min">
           <Calendar
              mode="single"
              selected={selectedDateForTask}
              onSelect={handleDateSelect}
              className="p-0"
              classNames={{
                months: "p-4"
              }}
            />
        </DialogContent>
      </Dialog>


      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log a New Task for {selectedDateForTask ? format(selectedDateForTask, 'PPP') : ''}</DialogTitle>
            <DialogDescription>
              Input the details for a new task objective. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onAddTask={handleAddTask} selectedDate={selectedDateForTask} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
