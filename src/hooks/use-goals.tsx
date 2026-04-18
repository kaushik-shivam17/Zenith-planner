'use client';

import { useCallback, useState, useEffect } from 'react';
import type { Goal } from '@/lib/types';
import { blink } from '@/blink/client';
import { useAuth } from '@/hooks/useAuth';

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: Pick<Goal, 'title' | 'description'>) => Promise<void>;
  toggleGoalCompletion: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  isLoading: boolean;
}

export function useGoals(missionId: string): GoalsContextType {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [areGoalsLoading, setAreGoalsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user || !missionId) {
      setGoals([]);
      setAreGoalsLoading(false);
      return;
    }

    try {
      const { data } = await blink.db.goals.list({
        where: { userId: user.id, missionId }
      });
      setGoals((data || []) as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setAreGoalsLoading(false);
    }
  }, [user, missionId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateMissionStats = useCallback(async () => {
    if (!user || !missionId) return;
    const { data: allGoals } = await blink.db.goals.list({ where: { userId: user.id, missionId } });
    const totalGoals = allGoals?.length || 0;
    const completedGoals = allGoals?.filter(g => g.completed).length || 0;
    
    await blink.db.missions.update({
      id: missionId,
      totalGoals,
      completedGoals
    });
  }, [user, missionId]);

  const addGoal = useCallback(
    async (goalData: Pick<Goal, 'title' | 'description'>) => {
      if (!user) return;
      try {
        await blink.db.goals.create({
          id: crypto.randomUUID(),
          userId: user.id,
          missionId,
          ...goalData,
          completed: false,
          createdAt: new Date().toISOString()
        });
        await fetchGoals();
        await updateMissionStats();
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    },
    [user, missionId, fetchGoals, updateMissionStats]
  );

  const toggleGoalCompletion = useCallback(
    async (goalId: string) => {
      if (!user) return;
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        try {
          await blink.db.goals.update({
            id: goalId,
            completed: !goal.completed
          });
          await fetchGoals();
          await updateMissionStats();
        } catch (error) {
          console.error('Error toggling goal:', error);
        }
      }
    },
    [user, goals, fetchGoals, updateMissionStats]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;
      try {
        await blink.db.goals.delete(goalId);
        await fetchGoals();
        await updateMissionStats();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    },
    [user, fetchGoals, updateMissionStats]
  );

  const isLoading = isAuthLoading || areGoalsLoading;

  return {
    goals,
    addGoal,
    toggleGoalCompletion,
    deleteGoal,
    isLoading,
  };
}
