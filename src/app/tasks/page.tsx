'use client';

import { useContext } from 'react';
import { TaskManager } from '@/components/task-manager';
import { Loader2 } from 'lucide-react';
import { DataContext } from '@/context/data-provider';

export default function TasksPage() {
  const { tasks, addTask, updateTask, toggleTaskCompletion, isLoading } = useContext(DataContext);
  
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
