'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
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
  updateMission: (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => void;
  deleteMission: (missionId: string) => Promise<void>;
  isLoading: boolean;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export function MissionsProvider({ children }: { children: ReactNode }) {
  const { user, firestore, isUserLoading } = useFirebase();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // We are ready to fetch when the user loading is finished and we have a user object.
    if (!isUserLoading && user) {
      setIsReady(true);
    }
  }, [isUserLoading, user]);

  const missionsCollectionRef = useMemoFirebase(
    () => (isReady && user ? collection(firestore, 'users', user.uid, 'missions') : null),
    [isReady, user, firestore]
  );

  const { data: missionsData, isLoading: isMissionsLoading } = useCollection<Omit<Mission, 'id'|'progress'>>(missionsCollectionRef);

  const missions = useMemo(() => {
    if (!missionsData) return [];
    
    return missionsData.map(mission => {
      const progress = mission.totalGoals > 0 ? (mission.completedGoals / mission.totalGoals) * 100 : 0;
      return {
        ...mission,
        progress,
      };
    });
  }, [missionsData]);


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
        totalGoals: 0,
        completedGoals: 0,
      };
      addDocumentNonBlocking(missionsCollectionRef, newMission);
    },
    [missionsCollectionRef, user]
  );
  
  const updateMission = useCallback(
    (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => {
        if (!missionsCollectionRef) return;
        const missionDocRef = doc(missionsCollectionRef, missionId);
        updateDocumentNonBlocking(missionDocRef, updates);
    },
    [missionsCollectionRef]
  );


   const deleteMission = useCallback(
    async (missionId: string) => {
      if (!missionsCollectionRef || !user) return;
      
      const batch = writeBatch(firestore);

      // Delete goals from the sub-collection
      const goalsSubCollectionRef = collection(firestore, 'users', user.uid, 'missions', missionId, 'goals');
      const goalsSubSnapshot = await getDocs(goalsSubCollectionRef);
      goalsSubSnapshot.forEach(goalDoc => {
        batch.delete(goalDoc.ref);
      });
      
      // Delete the mission document itself
      const missionDocRef = doc(missionsCollectionRef, missionId);
      batch.delete(missionDocRef);

      // Commit the batch
      await batch.commit();
    },
    [missionsCollectionRef, user, firestore]
  );
  
  const isLoading = !isReady || isMissionsLoading;

  const value: MissionsContextType = {
    missions: missions || [],
    getMissionById,
    addMission,
    updateMission,
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
