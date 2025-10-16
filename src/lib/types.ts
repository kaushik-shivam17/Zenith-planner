
import type { Timestamp } from 'firebase/firestore';

export type Task = {
  id: string;
  title: string;
  description?: string;
  deadline: Timestamp;
  completed: boolean;
  subtasks?: string[];
  userId: string;
};

export type Mission = {
  id: string;
  userId: string;
  title: string;
  progress: number;
  createdAt: Timestamp;
  totalGoals: number;
  completedGoals: number;
};

export type Goal = {
  id: string;
  userId: string;
  missionId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Timestamp;
};

export type TimetableEvent = {
  id: string;
  userId: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'custom' | 'task';
};
