'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Header } from '@/components/header';
import { TaskManager } from '@/components/task-manager';
import { FocusSuggester } from '@/components/focus-suggester';
import { WellnessHub } from '@/components/wellness-hub';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Finish Math Homework',
    details: 'Complete exercises from chapter 5.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    completed: false,
  },
  {
    id: '2',
    title: 'Study for History Exam',
    details: 'Review notes on World War II.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
    completed: false,
  },
  {
    id: '3',
    title: 'Write English Essay',
    details: 'Draft and revise the essay on Shakespeare.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
    completed: true,
  },
];

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <Header />
        <TaskManager
          tasks={tasks}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onToggleTask={toggleTaskCompletion}
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <FocusSuggester />
          <WellnessHub />
        </div>
      </div>
    </main>
  );
}
