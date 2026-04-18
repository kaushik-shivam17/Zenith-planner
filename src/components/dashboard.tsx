'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lightbulb, Terminal, Cpu, Zap, Activity } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
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

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline' | 'roadmap'> & { deadline: Date }) => {
    addTask(taskData);
    setIsAddOpen(false);
  };

  return (
    <>
      <Card
        className="cyber-card relative group border-primary/20 bg-black/40 cursor-pointer overflow-hidden transition-all hover:scale-[1.02]"
        onClick={() => handleDateSelect(new Date())}
      >
        <div className="absolute top-0 right-0 p-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary/40 hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarOpen(true);
            }}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary/60">
            {format(date, 'eeee')}
          </div>
          <div className="text-7xl font-bold font-headline glow-primary text-primary tracking-tighter">
            {format(date, 'd')}
          </div>
          <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            {format(date, 'MMMM yyyy')}
          </div>
          
          <div className="pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <Zap size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-tighter">Initiate_Daily_Log</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="sm:max-w-auto p-0 w-min bg-card border-primary/20 cyber-card">
           <Calendar
              mode="single"
              selected={selectedDateForTask}
              onSelect={handleDateSelect}
              className="p-4 font-mono"
            />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 cyber-card">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary glow-primary uppercase tracking-tighter">
              NEW_TASK_ENTRY: {selectedDateForTask ? format(selectedDateForTask, 'dd_MM_yy') : ''}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase opacity-70">
              Inject mission parameters into the mainframe.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <TaskForm onAddTask={handleAddTask} selectedDate={selectedDateForTask} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WelcomeHeader() {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('MORNING_SEQUENCE');
        else if (hour < 18) setGreeting('AFTERNOON_SEQUENCE');
        else setGreeting('EVENING_SEQUENCE');
    }, []);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary/10 pb-8">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative h-16 w-16 rounded-full border-2 border-primary/50 flex items-center justify-center bg-card shadow-[0_0_15px_rgba(0,242,255,0.2)] overflow-hidden">
                        {user?.photoURL ? (
                           <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                           <Terminal size={32} className="text-primary" />
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">{greeting}_ACTIVE</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline glow-primary uppercase">
                        HELLO, {user?.displayName?.split(' ')[0] || 'OPERATOR'}
                    </h1>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">System_Load</span>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 w-4 rounded-full ${i <= 3 ? 'bg-primary glow-primary' : 'bg-primary/20'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductivityTipCard() {
    const [tip, setTip] = useState('');

    useEffect(() => {
        const dayIndex = new Date().getDate() % PRODUCTIVITY_TIPS.length;
        setTip(PRODUCTIVITY_TIPS[dayIndex]);
    }, []);

    if (!tip) return null;

    return (
        <Card className="bg-accent/5 border border-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={40} className="text-accent" />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-sm font-mono tracking-widest text-accent uppercase">
                    <Lightbulb size={16} className="glow-accent"/>
                    Tactical_Directive_Of_The_Day
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs font-mono text-accent/80 italic leading-relaxed uppercase tracking-tight">
                   {tip}
                </p>
            </CardContent>
        </Card>
    )
}

export function Dashboard() {
  return (
    <div className="space-y-10 fade-in py-6 pb-20">
        <WelcomeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex items-center justify-center p-8 rounded-2xl bg-black/40 border border-primary/20 relative overflow-hidden cyber-card group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                   <Activity size={14} className="text-primary/40 animate-pulse" />
                   <span className="text-[10px] font-mono text-primary/40 tracking-[0.2em]">SYNC_ESTABLISHED</span>
                </div>
                <Clock />
            </div>
            <InteractiveDateCard />
        </div>
        
        <ProductivityTipCard />
      
        <div className="flex flex-col items-center justify-center space-y-4 pt-10">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center max-w-sm leading-loose opacity-60">
                Select a network node to initiate logging or deploy AI protocols via the sidebar.
            </p>
        </div>
    </div>
  );
}
