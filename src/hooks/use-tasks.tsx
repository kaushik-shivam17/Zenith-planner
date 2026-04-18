'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { blink } from '@/blink/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface TasksHook {
  tasks: Task[];
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline' | 'roadmap'> & { deadline: Date }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  isLoading: boolean;
}

export function useTasks(): TasksHook {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [areTasksLoading, setAreTasksLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setAreTasksLoading(false);
      return;
    }

    try {
      const { data } = await blink.db.tasks.list({
        where: { userId: user.id },
        orderBy: { deadline: 'asc' }
      });
      
      const formattedTasks = (data || []).map(task => ({
        ...task,
        deadline: new Date(task.deadline),
        subtasks: typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : task.subtasks,
        roadmap: typeof task.roadmap === 'string' ? JSON.parse(task.roadmap) : task.roadmap
      })) as Task[];

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({ title: 'Error', description: 'Failed to fetch tasks', variant: 'destructive' });
    } finally {
      setAreTasksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTaskById = useCallback(
    (taskId: string) => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks]
  );

  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'deadline' | 'roadmap'> & { deadline: Date }) => {
      if (!user) return;
      try {
        const id = crypto.randomUUID();
        await blink.db.tasks.create({
          id,
          userId: user.id,
          ...taskData,
          deadline: taskData.deadline.toISOString(),
          completed: false,
          subtasks: JSON.stringify(taskData.subtasks || []),
          createdAt: new Date().toISOString()
        });
        await fetchTasks();
        toast({ title: 'Success', description: 'Task added successfully' });
      } catch (error) {
        console.error('Error adding task:', error);
        toast({ title: 'Error', description: 'Failed to add task', variant: 'destructive' });
      }
    },
    [user, fetchTasks]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => {
      if (!user) return;
      try {
        const formattedUpdates = { ...updates };
        if (updates.deadline instanceof Date) {
          (formattedUpdates as any).deadline = updates.deadline.toISOString();
        }
        if (updates.subtasks) {
          (formattedUpdates as any).subtasks = JSON.stringify(updates.subtasks);
        }
        if (updates.roadmap) {
          (formattedUpdates as any).roadmap = JSON.stringify(updates.roadmap);
        }

        await blink.db.tasks.update({
          id: taskId,
          ...formattedUpdates
        });
        await fetchTasks();
      } catch (error) {
        console.error('Error updating task:', error);
      }
    },
    [user, fetchTasks]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        await updateTask(taskId, { completed: !task.completed });
      }
    },
    [tasks, updateTask]
  );

  const isLoading = isAuthLoading || areTasksLoading;

  return {
    tasks,
    getTaskById,
    addTask,
    updateTask,
    toggleTaskCompletion,
    isLoading,
  };
}
