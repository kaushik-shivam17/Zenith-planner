'use client';

import { TaskManager } from '@/components/task-manager';
import { useTasks } from '@/hooks/use-tasks';

export default function TasksPage() {
  const { tasks, addTask, updateTask, toggleTaskCompletion } = useTasks();
  
  return (
    <TaskManager
      tasks={tasks}
      onAddTask={addTask}
      onUpdateTask={updateTask}
      onToggleTask={toggleTaskCompletion}
    />
  );
}
