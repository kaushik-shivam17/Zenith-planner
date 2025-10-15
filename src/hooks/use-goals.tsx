'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import type { Goal } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: Pick<Goal, 'title'>) => void;
  toggleGoalCompletion: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  isLoading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

// This is not a real provider. It's a hook that scopes goals to a mission.
export function useGoals(missionId: string) {
  const { user, firestore } = useFirebase();

  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'missions', missionId, 'goals') : null),
    [user, firestore, missionId]
  );
  
  // Also create a reference to the global goals collection for progress calculation
  const globalGoalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/goals`) : null),
    [user, firestore]
  );

  const { data: goals, isLoading } = useCollection<Goal>(goalsCollectionRef);

  const addGoal = useCallback(
    (goalData: Pick<Goal, 'title'>) => {
      if (!goalsCollectionRef || !globalGoalsCollectionRef || !user) return;
      const newGoal = {
        ...goalData,
        userId: user.uid,
        missionId,
        completed: false,
        createdAt: serverTimestamp(),
      };
      // Add to both collections non-blockingly
      addDocumentNonBlocking(goalsCollectionRef, newGoal);
      addDocumentNonBlocking(globalGoalsCollectionRef, newGoal);
    },
    [goalsCollectionRef, globalGoalsCollectionRef, user, missionId]
  );

  const toggleGoalCompletion = useCallback(
    (goalId: string) => {
      if (!goalsCollectionRef || !globalGoalsCollectionRef || !goals) return;
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        const newCompletedState = !goal.completed;
        const goalDocRef = doc(goalsCollectionRef, goalId);
        const globalGoalDocRef = doc(globalGoalsCollectionRef, goalId);

        updateDocumentNonBlocking(goalDocRef, { completed: newCompletedState });
        updateDocumentNonBlocking(globalGoalDocRef, { completed: newCompletedState });
      }
    },
    [goalsCollectionRef, globalGoalsCollectionRef, goals]
  );

  const deleteGoal = useCallback(
    (goalId: string) => {
      if (!goalsCollectionRef || !globalGoalsCollectionRef) return;
      const goalDocRef = doc(goalsCollectionRef, goalId);
      const globalGoalDocRef = doc(globalGoalsCollectionRef, goalId);
      deleteDocumentNonBlocking(goalDocRef);
      deleteDocumentNonBlocking(globalGoalDocRef);
    },
    [goalsCollectionRef, globalGoalsCollectionRef]
  );

  return {
    goals: goals || [],
    addGoal,
    toggleGoalCompletion,
    deleteGoal,
    isLoading,
  };
}
