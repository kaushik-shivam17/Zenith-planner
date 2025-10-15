'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
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
import { collection, doc, serverTimestamp } from 'firebase/firestore';

interface MissionsContextType {
  missions: Mission[];
  getMissionById: (missionId: string) => Mission | undefined;
  addMission: (missionData: Pick<Mission, 'title'>) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  deleteMission: (missionId: string) => void;
  isLoading: boolean;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export function MissionsProvider({ children }: { children: ReactNode }) {
  const { user, firestore } = useFirebase();

  const missionsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'missions') : null),
    [user, firestore]
  );

  const { data: missions, isLoading } = useCollection<Mission>(missionsCollectionRef);

  const getMissionById = useCallback(
    (missionId: string) => {
      return missions?.find((mission) => mission.id === missionId);
    },
    [missions]
  );

  const addMission = useCallback(
    (missionData: Pick<Mission, 'title'>) => {
      if (!missionsCollectionRef) return;
      const newMission = {
        ...missionData,
        userId: user!.uid,
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
    (missionId: string) => {
      if (!missionsCollectionRef) return;
      const missionDocRef = doc(missionsCollectionRef, missionId);
      deleteDocumentNonBlocking(missionDocRef);
    },
    [missionsCollectionRef]
  );

  const value = {
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
