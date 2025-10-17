'use client';

import {
  useCallback,
} from 'react';
import type { TimetableEvent } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, writeBatch, doc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

interface TimetableHook {
  events: TimetableEvent[];
  setEvents: (events: Omit<TimetableEvent, 'id' | 'userId'>[]) => Promise<void>;
  addCustomEvents: (events: Omit<TimetableEvent, 'id' | 'userId' | 'type'>[]) => Promise<void>;
  deleteCustomEvent: (eventId: string) => Promise<void>;
  clearEvents: (type: 'task' | 'custom' | 'all') => Promise<void>;
  isLoading: boolean;
}

export function useTimetable(): TimetableHook {
  const { user, firestore, isUserLoading, areServicesAvailable } = useFirebase();

  const timetableCollectionRef = useMemoFirebase(
    () => {
        if (!areServicesAvailable || isUserLoading || !user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'timetableEvents');
    },
    [areServicesAvailable, isUserLoading, user, firestore]
  );

  const { data: eventsData, isLoading: areEventsLoading } = useCollection<TimetableEvent>(timetableCollectionRef);

  const setEvents = useCallback(async (newEvents: Omit<TimetableEvent, 'id' | 'userId'>[]) => {
      if (!timetableCollectionRef || !user || !firestore) return;
      const batch = writeBatch(firestore);
      
      try {
        // Delete all existing events first. This is simpler than diffing.
        const snapshot = await getDocs(timetableCollectionRef);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        // Add new events
        newEvents.forEach(event => {
          const newEventRef = doc(timetableCollectionRef);
          const eventWithUser = { ...event, id: newEventRef.id, userId: user.uid };
          batch.set(newEventRef, eventWithUser);
        });
        
        await batch.commit();
      } catch (error) {
        console.error('Error setting events: ', error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: timetableCollectionRef.path,
          operation: 'write', // This is a batch write, so 'write' is a general term
        }));
      }
    }, [timetableCollectionRef, user, firestore]);

  const addCustomEvents = useCallback(async (customEvents: Omit<TimetableEvent, 'id' | 'userId' | 'type'>[]) => {
      if (!timetableCollectionRef || !user) return;
      
      try {
        const batch = writeBatch(timetableCollectionRef.firestore);
        for (const event of customEvents) {
          const newEventRef = doc(timetableCollectionRef);
          const eventWithUser = { ...event, id: newEventRef.id, userId: user.uid, type: 'custom' as 'custom' };
          batch.set(newEventRef, eventWithUser);
        }
        await batch.commit();
      } catch (error) {
          console.error('Error adding custom event:', error);
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: timetableCollectionRef.path,
            operation: 'create',
            // Note: can't provide specific data for batch writes easily
          }));
      }
      
  }, [timetableCollectionRef, user]);

  const deleteCustomEvent = useCallback(async (eventId: string) => {
    if (!timetableCollectionRef) return;
    const eventDocRef = doc(timetableCollectionRef, eventId);
    try {
      await deleteDoc(eventDocRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: eventDocRef.path,
        operation: 'delete',
      }));
    }
  }, [timetableCollectionRef]);


  const clearEvents = useCallback(async (type: 'task' | 'custom' | 'all') => {
      if (!timetableCollectionRef || !eventsData || !firestore) return;

      const batch = writeBatch(firestore);
      
      eventsData.forEach(event => {
        if (type === 'all' || event.type === type) {
          const eventDocRef = doc(timetableCollectionRef, event.id);
          batch.delete(eventDocRef);
        }
      });
      
      try {
        await batch.commit();
      } catch (error) {
         console.error('Error clearing events: ', error);
         errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: timetableCollectionRef.path,
          operation: 'delete',
        }));
      }
    }, [timetableCollectionRef, eventsData, firestore]);


  const isLoading = isUserLoading || (!!user && areEventsLoading);

  return {
    events: eventsData || [],
    setEvents,
    addCustomEvents,
    deleteCustomEvent,
    clearEvents,
    isLoading,
  };
}
