'use client';

import {
  useCallback,
  useMemo,
} from 'react';
import type { Mission } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, serverTimestamp, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { addDocument, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface MissionsHook {
  missions: Mission[];
  getMissionById: (missionId: string) => Mission | undefined;
  addMission: (missionData: Pick<Mission, 'title'>) => Promise<void>;
  updateMission: (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  isLoading: boolean;
}

export function useMissions(): MissionsHook {
  const { user, firestore, isUserLoading, areServicesAvailable } = useFirebase();

  const missionsCollectionRef = useMemoFirebase(
    () => {
      if (!areServicesAvailable || isUserLoading || !user || !firestore) return null;
      return collection(firestore, 'users', user.uid, 'missions');
    },
    [areServicesAvailable, isUserLoading, user, firestore]
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
    async (missionData: Pick<Mission, 'title'>) => {
      if (!missionsCollectionRef || !user) return;
      const newMission = {
        ...missionData,
        userId: user.uid,
        progress: 0,
        createdAt: serverTimestamp(),
        totalGoals: 0,
        completedGoals: 0,
      };
      await addDocument(missionsCollectionRef, newMission);
    },
    [missionsCollectionRef, user]
  );
  
  const updateMission = useCallback(
    async (missionId: string, updates: Partial<Omit<Mission, 'id' | 'userId'>>) => {
        if (!missionsCollectionRef) return;
        const missionDocRef = doc(missionsCollectionRef, missionId);
        updateDocumentNonBlocking(missionDocRef, updates);
    },
    [missionsCollectionRef]
  );


   const deleteMission = useCallback(
    async (missionId: string) => {
      if (!user || !firestore) return;
      
      const missionDocRef = doc(firestore, 'users', user.uid, 'missions', missionId);
      const goalsCollectionRef = collection(missionDocRef, 'goals');
      
      try {
        const batch = writeBatch(firestore);
        
        // Delete goals subcollection
        const goalsSnapshot = await getDocs(goalsCollectionRef);
        goalsSnapshot.forEach(goalDoc => {
          batch.delete(goalDoc.ref);
        });
      
        // Delete the mission document itself
        batch.delete(missionDocRef);

        await batch.commit();
      } catch (error) {
        // A more specific error would be better, but we don't know which operation failed.
         errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: missionDocRef.path, // or goalsCollectionRef.path
              operation: 'delete',
            })
        );
      }
    },
    [user, firestore]
  );
  
  const isLoading = isUserLoading || (!!user && isMissionsLoading);

  return {
    missions: missions || [],
    getMissionById,
    addMission,
    updateMission,
    deleteMission,
    isLoading,
  };
}
