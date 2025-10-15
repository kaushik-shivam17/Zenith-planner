import type { Timestamp } from 'firebase/firestore';

export type Task = {
  id: string;
  title: string;
  details?: string;
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
};
