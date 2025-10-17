
'use client';

import {
  useCallback,
} from 'react';
import type { Goal } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: Pick<Goal, 'title' | 'description'>) => Promise<void>;
  toggleGoalCompletion: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  isLoading: boolean;
}

// This is not a real provider. It's a hook that scopes goals to a mission.
export function useGoals(missionId: string): GoalsContextType {
  const { user, firestore, isUserLoading } = useFirebase();

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
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newGoalRef.path,
          operation: 'create',
          requestResourceData: newGoal
        }));
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
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: goalDocRef.path,
            operation: 'update',
            requestResourceData: { completed: !goal.completed }
          }));
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
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: goalDocRef.path,
          operation: 'delete',
        }));
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
