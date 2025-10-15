'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Task } from '@/lib/types';

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

interface TasksContextType {
  tasks: Task[];
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (taskData: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (updatedTask: Task) => void;
  toggleTaskCompletion: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

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
    <TasksContext.Provider value={{ tasks, getTaskById, addTask, updateTask, toggleTaskCompletion }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
