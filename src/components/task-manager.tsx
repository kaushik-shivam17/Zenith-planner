'use client';

import { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';

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
import type { Task } from '@/lib/types';
import { useData } from '@/context/data-provider';


export function TaskManager() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { tasks, addTask, updateTask, toggleTaskCompletion, isLoading } = useData();


  const handleTaskAdded = async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => {
    await addTask(taskData);
    setIsAddOpen(false);
  };
  
    if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Task Matrix</CardTitle>
          <CardDescription>
            View, manage, and add new objectives.
          </CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log a New Task</DialogTitle>
              <DialogDescription>
                Input the details for a new task objective. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onAddTask={(data) => {
                addTask(data);
                setIsAddOpen(false);
            }} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <TaskList
          tasks={tasks}
          onUpdateTask={(updatedTask) => updateTask(updatedTask.id, updatedTask)}
          onToggleTask={toggleTaskCompletion}
        />
      </CardContent>
    </Card>
  );
}
