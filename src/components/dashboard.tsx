'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lightbulb, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/task-form';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { Task } from '@/lib/types';
import { Clock } from '@/components/clock';
import { useUser } from '@/firebase';
import { PRODUCTIVITY_TIPS } from '@/lib/constants';

function InteractiveDateCard() {
  const [date] = useState(new Date());
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
    <>
      <Card
        className="cursor-pointer hover:bg-card/70 transition-colors relative group border-dashed hover:border-primary"
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
            {format(date, 'eeee')}
          </div>
          <div className="text-6xl md:text-7xl font-bold text-primary">
            {format(date, 'd')}
          </div>
          <div className="text-xl md:text-2xl font-semibold text-muted-foreground">
            {format(date, 'MMMM yyyy')}
          </div>
          <div className="absolute bottom-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Click to add a task for today
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="sm:max-w-auto p-0 w-min">
           <Calendar
              mode="single"
              selected={selectedDateForTask}
              onSelect={handleDateSelect}
              className="p-0"
              classNames={{ months: "p-4" }}
            />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log a New Task for {selectedDateForTask ? format(selectedDateForTask, 'PPP') : ''}</DialogTitle>
            <DialogDescription>
              Input the details for a new task objective. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onAddTask={handleAddTask} selectedDate={selectedDateForTask} />
        </DialogContent>
      </Dialog>
    </>
  );
}


function WelcomeHeader() {
    const { user } = useUser();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good Morning');
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }
    }, []);

    return (
        <div className="flex items-center gap-4">
             <User className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {greeting}, {user?.displayName?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                    Ready to conquer your goals today?
                </p>
            </div>
        </div>
    );
}

function ProductivityTipCard() {
    const [tip, setTip] = useState('');

    useEffect(() => {
        // This ensures the same tip is shown for a given day, and it only runs on the client.
        const dayIndex = new Date().getDate() % PRODUCTIVITY_TIPS.length;
        setTip(PRODUCTIVITY_TIPS[dayIndex]);
    }, []);

    if (!tip) return null;

    return (
        <Card className="bg-secondary/50 border-l-4 border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                    <Lightbulb className="text-accent"/>
                    Productivity Tip of the Day
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground italic">{tip}</p>
            </CardContent>
        </Card>
    )
}

export function Dashboard() {
  return (
    <div className="space-y-8 fade-in">
        <WelcomeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 rounded-lg bg-card">
                <Clock />
            </div>
            <InteractiveDateCard />
        </div>
        
        <ProductivityTipCard />
      
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">
                Select a date to quickly add a new task or choose a tool from the sidebar.
            </p>
        </div>
    </div>
  );
}
