
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
  const { user, firestore, isUserLoading } = useFirebase();
  const { getMissionById } = useMissions();

  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'missions', missionId, 'goals') : null),
    [user, firestore, missionId]
  );
  
  const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsCollectionRef);

  const addGoal = useCallback(
    async (goalData: Pick<Goal, 'title' | 'description'>) => {
      if (!user || !firestore) return;
      
      const goalsColRef = collection(firestore, 'users', user.uid, 'missions', missionId, 'goals');
      const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);
      const newGoalRef = doc(goalsColRef);

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
    [user, firestore, missionId]
  );

  const toggleGoalCompletion = useCallback(
    async (goalId: string) => {
      if (!user || !firestore || !goals) return;
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        const goalDocRef = doc(firestore, 'users', user.uid, 'missions', missionId, 'goals', goalId);
        const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);
        
        try {
           await runTransaction(firestore, async (transaction) => {
            transaction.update(goalDocRef, { completed: !goal.completed });
            transaction.update(missionDocRef, { completedGoals: increment(!goal.completed ? 1 : -1) });
          });
        } catch (e) {
          console.error("Transaction failed: ", e);
        }
      }
    },
    [goals, user, firestore, missionId]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!user || !firestore || !goals) return;
      
      const goalToDelete = goals.find(g => g.id === goalId);
      if (!goalToDelete) return;

      const goalDocRef = doc(firestore, 'users', user.uid, 'missions', missionId, 'goals', goalId);
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
    [user, firestore, missionId, goals]
  );

  const isLoading = isUserLoading || areGoalsLoading;

  return {
    goals: goals || [],
    addGoal,
    toggleGoalCompletion,
    deleteGoal,
    isLoading,
  };
}
