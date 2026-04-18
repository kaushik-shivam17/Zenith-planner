'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Mission } from '@/lib/types';
import { blink } from '@/blink/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface MissionsHook {
  missions: Mission[];
  getMissionById: (missionId: string) => Mission | undefined;
  addMission: (missionData: Pick<Mission, 'title'>) => Promise<void>;
  updateMission: (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  isLoading: boolean;
}

export function useMissions(): MissionsHook {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [areMissionsLoading, setAreMissionsLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setAreMissionsLoading(false);
      return;
    }

    try {
      const { data } = await blink.db.missions.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      
      const formattedMissions = (data || []).map(mission => {
        const totalGoals = mission.totalGoals || 0;
        const completedGoals = mission.completedGoals || 0;
        const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        return {
          ...mission,
          progress,
          createdAt: new Date(mission.createdAt),
          roadmap: typeof mission.roadmap === 'string' ? JSON.parse(mission.roadmap) : mission.roadmap
        };
      }) as Mission[];

      setMissions(formattedMissions);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setAreMissionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const getMissionById = useCallback(
    (missionId: string) => {
      return missions.find((mission) => mission.id === missionId);
    },
    [missions]
  );

  const addMission = useCallback(
    async (missionData: Pick<Mission, 'title'>) => {
      if (!user) return;
      try {
        const id = crypto.randomUUID();
        await blink.db.missions.create({
          id,
          userId: user.id,
          ...missionData,
          totalGoals: 0,
          completedGoals: 0,
          progress: 0,
          createdAt: new Date().toISOString()
        });
        await fetchMissions();
        toast({ title: 'Mission Initiated', description: 'System tracking started.' });
      } catch (error) {
        console.error('Error adding mission:', error);
      }
    },
    [user, fetchMissions]
  );

  const updateMission = useCallback(
    async (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => {
      if (!user) return;
      try {
        const formattedUpdates = { ...updates };
        if (updates.roadmap) {
          (formattedUpdates as any).roadmap = JSON.stringify(updates.roadmap);
        }
        await blink.db.missions.update({
          id: missionId,
          ...formattedUpdates
        });
        await fetchMissions();
      } catch (error) {
        console.error('Error updating mission:', error);
      }
    },
    [user, fetchMissions]
  );

  const deleteMission = useCallback(
    async (missionId: string) => {
      if (!user) return;
      try {
        await blink.db.missions.delete(missionId);
        // Also delete associated goals
        const { data: goals } = await blink.db.goals.list({ where: { missionId } });
        if (goals) {
          for (const goal of goals) {
            await blink.db.goals.delete(goal.id);
          }
        }
        await fetchMissions();
        toast({ title: 'Mission Terminated', description: 'Data purged from system.' });
      } catch (error) {
        console.error('Error deleting mission:', error);
      }
    },
    [user, fetchMissions]
  );

  const isLoading = isAuthLoading || areMissionsLoading;

  return {
    missions,
    getMissionById,
    addMission,
    updateMission,
    deleteMission,
    isLoading,
  };
}
