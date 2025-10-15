'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { Mission } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface MissionsContextType {
  missions: Mission[];
  getMissionById: (missionId: string) => Mission | undefined;
  addMission: (missionData: Pick<Mission, 'title'>) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  deleteMission: (missionId: string) => Promise<void>;
  isLoading: boolean;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export function MissionsProvider({ children }: { children: ReactNode }) {
  const { user, firestore } = useFirebase();

  const missionsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'missions') : null),
    [user, firestore]
  );
  
  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/goals`) : null),
    [user, firestore]
  );

  const { data: missionsData, isLoading: isMissionsLoading } = useCollection<Omit<Mission, 'id'|'progress'>>(missionsCollectionRef);
  const { data: allGoals, isLoading: areGoalsLoading } = useCollection<{missionId: string, completed: boolean}>(goalsCollectionRef);

  const missions = useMemo(() => {
    if (!missionsData) return [];
    
    return missionsData.map(mission => {
      const missionGoals = allGoals?.filter(goal => goal.missionId === mission.id) || [];
      const completedGoals = missionGoals.filter(goal => goal.completed).length;
      const progress = missionGoals.length > 0 ? (completedGoals / missionGoals.length) * 100 : 0;
      
      return {
        ...mission,
        progress,
      };
    });
  }, [missionsData, allGoals]);


  const getMissionById = useCallback(
    (missionId: string) => {
      return missions?.find((mission) => mission.id === missionId);
    },
    [missions]
  );

  const addMission = useCallback(
    (missionData: Pick<Mission, 'title'>) => {
      if (!missionsCollectionRef || !user) return;
      const newMission = {
        ...missionData,
        userId: user.uid,
        progress: 0,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(missionsCollectionRef, newMission);
    },
    [missionsCollectionRef, user]
  );

  const updateMissionProgress = useCallback(
    (missionId: string, progress: number) => {
      if (!missionsCollectionRef) return;
      const missionDocRef = doc(missionsCollectionRef, missionId);
      updateDocumentNonBlocking(missionDocRef, { progress });
    },
    [missionsCollectionRef]
  );

   const deleteMission = useCallback(
    async (missionId: string) => {
      if (!missionsCollectionRef || !goalsCollectionRef || !user) return;
      
      const batch = writeBatch(firestore);

      // 1. Delete goals from the sub-collection
      const goalsSubCollectionRef = collection(firestore, 'users', user.uid, 'missions', missionId, 'goals');
      const goalsSubSnapshot = await getDocs(goalsSubCollectionRef);
      goalsSubSnapshot.forEach(goalDoc => {
        batch.delete(goalDoc.ref);
      });

      // 2. Delete goals from the global collection
      const q = query(goalsCollectionRef, where("missionId", "==", missionId));
      const goalsGlobalSnapshot = await getDocs(q);
      goalsGlobalSnapshot.forEach(goalDoc => {
        batch.delete(goalDoc.ref);
      });
      
      // 3. Delete the mission document itself
      const missionDocRef = doc(missionsCollectionRef, missionId);
      batch.delete(missionDocRef);

      // 4. Commit the batch
      await batch.commit();
    },
    [missionsCollectionRef, goalsCollectionRef, user, firestore]
  );
  
  const isLoading = isMissionsLoading || areGoalsLoading;

  const value: MissionsContextType = {
    missions: missions || [],
    getMissionById,
    addMission,
    updateMissionProgress,
    deleteMission,
    isLoading,
  };

  return (
    <MissionsContext.Provider value={value}>{children}</MissionsContext.Provider>
  );
}

export function useMissions() {
  const context = useContext(MissionsContext);
  if (context === undefined) {
    throw new Error('useMissions must be used within a MissionsProvider');
  }
  return context;
}
