'use client';

import { useState } from 'react';
import { Loader2, PlusCircle, Terminal, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import { useData } from '@/context/data-provider';
import type { Task } from '@/lib/types';


export function TaskManager() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { tasks, addTask, updateTask, toggleTaskCompletion, isLoading } = useData();


  const handleTaskAdded = async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline' | 'roadmap'> & { deadline: Date }) => {
    await addTask(taskData);
    setIsAddOpen(false);
  };
  
    if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-primary glow-primary" />
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Syncing_Nodes...</span>
      </div>
    );
  }


  return (
    <Card className="cyber-card bg-black/40 border-primary/20">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-primary/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded border border-primary/30 bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.1)]">
            <Terminal size={20} className="text-primary glow-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-mono font-bold tracking-tighter text-primary glow-primary uppercase">Task_Matrix</CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase tracking-widest opacity-60">
              Interface for objective management & deployment.
            </CardDescription>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="cyber-button bg-primary text-black font-mono font-bold text-xs h-10 w-full sm:w-auto px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              INJECT_TASK
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-mono tracking-tighter glow-primary text-primary uppercase">LOG_NEW_OBJECTIVE</DialogTitle>
              <DialogDescription className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                Define the parameters for a new strategic mission.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              <TaskForm onAddTask={handleTaskAdded} />
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="pt-8">
        <div className="flex items-center gap-2 mb-6 opacity-40">
           <Activity size={12} className="text-primary animate-pulse" />
           <span className="text-[9px] font-mono tracking-widest text-primary uppercase">Active_Link_Established</span>
        </div>
        
        <TaskList
          tasks={tasks}
          onUpdateTask={(updatedTask) => updateTask(updatedTask.id, updatedTask)}
          onToggleTask={toggleTaskCompletion}
        />
      </CardContent>
    </Card>
  );
}
