'use client';

import { TaskManager } from '@/components/task-manager';
import { useTasks } from '@/hooks/use-tasks';
import { Loader2 } from 'lucide-react';

export default function TasksPage() {
  const { tasks, addTask, updateTask, toggleTaskCompletion, isLoading } = useTasks();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TaskManager
      tasks={tasks}
      onAddTask={addTask}
      onUpdateTask={(updatedTask) => updateTask(updatedTask.id, updatedTask)}
      onToggleTask={toggleTaskCompletion}
    />
  );
}
