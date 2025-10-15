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
