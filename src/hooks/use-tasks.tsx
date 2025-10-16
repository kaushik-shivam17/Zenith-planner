'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import type { Task } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface TasksContextType {
  tasks: Task[];
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => void;
  toggleTaskCompletion: (taskId: string) => void;
  isLoading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user, firestore, isUserLoading } = useFirebase();

  const tasksCollectionRef = useMemoFirebase(
    () => {
        if(isUserLoading || !user) return null;
        return collection(firestore, 'users', user.uid, 'tasks');
    },
    [isUserLoading, user, firestore]
  );

  const { data: rawTasks, isLoading: areTasksLoading } = useCollection<Omit<Task, 'id'>>(
    tasksCollectionRef
  );

  const tasks = useMemo((): Task[] => {
    if (!rawTasks) return [];
    return rawTasks.map((task) => ({
      ...task,
      // Safely convert Firestore Timestamp to JS Date for client-side use
      deadline: task.deadline instanceof Timestamp ? task.deadline.toDate() : new Date(),
    })).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [rawTasks]);


  const getTaskById = useCallback(
    (taskId: string) => {
      const task = tasks.find((task) => task.id === taskId);
      if (!task) return undefined;
      // Return a version of the task with a JS Date object
      return {
        ...task,
        deadline: task.deadline instanceof Timestamp ? task.deadline.toDate() : task.deadline,
      };
    },
    [tasks]
  );

  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => {
      if (!tasksCollectionRef || !user) return;
      const newTask = {
        ...taskData,
        userId: user!.uid,
        completed: false,
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(taskData.deadline), // Convert JS Date to Firestore Timestamp
      };
      addDocumentNonBlocking(tasksCollectionRef, newTask);
    },
    [tasksCollectionRef, user]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => {
      if (!tasksCollectionRef) return;
      const taskDocRef = doc(tasksCollectionRef, taskId);
      
      const updatesForFirestore = { ...updates };
      if (updates.deadline && updates.deadline instanceof Date) {
        (updatesForFirestore as any).deadline = Timestamp.fromDate(updates.deadline);
      }

      updateDocumentNonBlocking(taskDocRef, updatesForFirestore);
    },
    [tasksCollectionRef]
  );

  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      if (!tasksCollectionRef) return;
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const taskDocRef = doc(tasksCollectionRef, taskId);
        updateDocumentNonBlocking(taskDocRef, { completed: !task.completed });
      }
    },
    [tasksCollectionRef, tasks]
  );

  const isLoading = isUserLoading || (!!user && areTasksLoading);

  const value = {
    tasks: tasks.map(t => ({...t, deadline: t.deadline instanceof Timestamp ? t.deadline.toDate() : t.deadline})),
    getTaskById,
    addTask,
    updateTask,
    toggleTaskCompletion,
    isLoading,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
