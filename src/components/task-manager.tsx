'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';


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

type Task = {
  id: string;
  title: string;
  details?: string;
  deadline: Date; 
  completed: boolean;
  subtasks?: string[];
};

type TaskManagerProps = {
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onToggleTask: (taskId: string) => void;
};

export function TaskManager({
  tasks,
  onAddTask,
  onUpdateTask,
  onToggleTask,
}: TaskManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleTaskAdded = (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => {
    onAddTask(taskData);
    setIsAddOpen(false);
  };

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
            <TaskForm onAddTask={handleTaskAdded} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <TaskList
          tasks={tasks}
          onUpdateTask={onUpdateTask}
          onToggleTask={onToggleTask}
        />
      </CardContent>
    </Card>
  );
}
