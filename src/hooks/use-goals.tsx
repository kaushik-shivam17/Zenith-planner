
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
import { collection, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { useMissions } from './use-missions';

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: Pick<Goal, 'title' | 'description'>) => void;
  toggleGoalCompletion: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  isLoading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

// This is not a real provider. It's a hook that scopes goals to a mission.
export function useGoals(missionId: string) {
  const { user, firestore } = useFirebase();
  const { getMissionById } = useMissions();

  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'missions', missionId, 'goals') : null),
    [user, firestore, missionId]
  );
  
  const { data: goals, isLoading } = useCollection<Goal>(goalsCollectionRef);

  const addGoal = useCallback(
    async (goalData: Pick<Goal, 'title' | 'description'>) => {
      if (!goalsCollectionRef || !user) return;
      
      const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);
      const newGoalRef = doc(goalsCollectionRef);

      const newGoal = {
        ...goalData,
        id: newGoalRef.id,
        userId: user.uid,
        missionId,
        completed: false,
        createdAt: serverTimestamp(),
      };
      
      try {
        await runTransaction(firestore, async (transaction) => {
          transaction.set(newGoalRef, newGoal);
          transaction.update(missionDocRef, { totalGoals: increment(1) });
        });
      } catch (e) {
        console.error("Transaction failed: ", e);
      }
    },
    [goalsCollectionRef, user, missionId, firestore]
  );

  const toggleGoalCompletion = useCallback(
    async (goalId: string) => {
      if (!goalsCollectionRef || !goals) return;
      const goal = goals.find((g) => g.id === goalId);
      if (goal && user) {
        const newCompletedState = !goal.completed;
        const goalDocRef = doc(goalsCollectionRef, goalId);
        const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);
        
        try {
           await runTransaction(firestore, async (transaction) => {
            transaction.update(goalDocRef, { completed: newCompletedState });
            transaction.update(missionDocRef, { completedGoals: increment(newCompletedState ? 1 : -1) });
          });
        } catch (e) {
          console.error("Transaction failed: ", e);
        }
      }
    },
    [goalsCollectionRef, goals, user, missionId, firestore]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!goalsCollectionRef || !user || !goals) return;
      
      const goalToDelete = goals.find(g => g.id === goalId);
      if (!goalToDelete) return;

      const goalDocRef = doc(goalsCollectionRef, goalId);
      const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);

      try {
        await runTransaction(firestore, async (transaction) => {
          transaction.delete(goalDocRef);
          const decrementCompleted = goalToDelete.completed ? -1 : 0;
          transaction.update(missionDocRef, { 
            totalGoals: increment(-1),
            completedGoals: increment(decrementCompleted),
           });
        });
      } catch (e) {
        console.error("Transaction failed: ", e);
      }
    },
    [goalsCollectionRef, user, missionId, firestore, goals]
  );

  return {
    goals: goals || [],
    addGoal,
    toggleGoalCompletion,
    deleteGoal,
    isLoading,
  };
}
