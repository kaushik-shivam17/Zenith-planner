'use client';

import {
  useCallback,
  useMemo,
} from 'react';
import type { Task } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  addDoc,
  updateDoc,
} from 'firebase/firestore';

interface TasksHook {
  tasks: Task[];
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  isLoading: boolean;
}

export function useTasks(): TasksHook {
  const { user, firestore, isUserLoading, areServicesAvailable } = useFirebase();

  const tasksCollectionRef = useMemoFirebase(
    () => {
        if (!areServicesAvailable || isUserLoading || !user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'tasks');
    },
    [areServicesAvailable, isUserLoading, user, firestore]
  );

  const { data: rawTasks, isLoading: areTasksLoading } = useCollection<Omit<Task, 'id'>>(
    tasksCollectionRef
  );

  const tasks = useMemo((): Task[] => {
    if (!rawTasks) return [];
    return rawTasks.map((task) => ({
      ...task,
      // Ensure deadline is always a JS Date object for consistent use in components
      deadline: task.deadline instanceof Timestamp ? task.deadline.toDate() : new Date(),
    })).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [rawTasks]);


  const getTaskById = useCallback(
    (taskId: string) => {
      const task = tasks.find((task) => task.id === taskId);
      if (!task) return undefined;
      return {
        ...task,
        deadline: task.deadline instanceof Timestamp ? task.deadline.toDate() : task.deadline,
      };
    },
    [tasks]
  );

  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline'> & { deadline: Date }) => {
      if (!tasksCollectionRef || !user) return;
      const newTask = {
        ...taskData,
        userId: user!.uid,
        completed: false,
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(taskData.deadline), // Convert JS Date to Firestore Timestamp
      };
      try {
        await addDoc(tasksCollectionRef, newTask);
      } catch (error) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: tasksCollectionRef.path,
            operation: 'create',
            requestResourceData: newTask,
          })
        );
      }
    },
    [tasksCollectionRef, user]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => {
      if (!tasksCollectionRef) return;
      const taskDocRef = doc(tasksCollectionRef, taskId);
      
      const updatesForFirestore = { ...updates };
      if (updates.deadline && updates.deadline instanceof Date) {
        (updatesForFirestore as any).deadline = Timestamp.fromDate(updates.deadline);
      }

      try {
        await updateDoc(taskDocRef, updatesForFirestore);
      } catch (error) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: updatesForFirestore,
          })
        );
      }
    },
    [tasksCollectionRef]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!tasksCollectionRef) return;
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const taskDocRef = doc(tasksCollectionRef, taskId);
        const newCompletedStatus = !task.completed;
        try {
          await updateDoc(taskDocRef, { completed: newCompletedStatus });
        } catch (error) {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: taskDocRef.path,
              operation: 'update',
              requestResourceData: { completed: newCompletedStatus },
            })
          );
        }
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

  return value;
}
