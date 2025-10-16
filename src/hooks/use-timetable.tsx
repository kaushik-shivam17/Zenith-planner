
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from 'react';
import type { TimetableEvent } from '@/lib/types';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

interface TimetableContextType {
  events: TimetableEvent[];
  setEvents: (events: Omit<TimetableEvent, 'id' | 'userId'>[]) => Promise<void>;
  addCustomEvents: (events: Omit<TimetableEvent, 'id' | 'userId'>[]) => Promise<void>;
  clearEvents: (type: 'task' | 'custom' | 'all') => Promise<void>;
  isLoading: boolean;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const { user, firestore, isUserLoading } = useFirebase();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      setIsReady(true);
    }
  }, [isUserLoading, user]);

  const timetableCollectionRef = useMemoFirebase(
    () => (isReady && user ? collection(firestore, 'users', user.uid, 'timetableEvents') : null),
    [isReady, user, firestore]
  );

  const { data: events, isLoading: areEventsLoading } = useCollection<TimetableEvent>(timetableCollectionRef);

  const setEvents = useCallback(async (newEvents: Omit<TimetableEvent, 'id' | 'userId'>[]) => {
      if (!timetableCollectionRef || !user || !events) return;
      const batch = writeBatch(firestore);
      
      // Delete all existing 'task' events
      events.forEach(event => {
        if (event.type === 'task') {
          const eventDocRef = doc(timetableCollectionRef, event.id);
          batch.delete(eventDocRef);
        }
      });

      // Add new events
      newEvents.forEach(event => {
        const newEventRef = doc(timetableCollectionRef);
        const eventWithUser = { ...event, id: newEventRef.id, userId: user.uid };
        batch.set(newEventRef, eventWithUser);
      });
      
      await batch.commit();
    }, [timetableCollectionRef, user, firestore, events]);

  const addCustomEvents = useCallback(async (customEvents: Omit<TimetableEvent, 'id' | 'userId'>[]) => {
      if (!timetableCollectionRef || !user) return;
      
      customEvents.forEach(event => {
        const eventWithUser = { ...event, userId: user.uid, type: 'custom' as 'custom' };
        addDocumentNonBlocking(timetableCollectionRef, eventWithUser);
      });
      
  }, [timetableCollectionRef, user]);

  const clearEvents = useCallback(async (type: 'task' | 'custom' | 'all') => {
      if (!timetableCollectionRef || !events) return;
      
      events.forEach(event => {
        if (type === 'all' || event.type === type) {
          const eventDocRef = doc(timetableCollectionRef, event.id);
          deleteDocumentNonBlocking(eventDocRef);
        }
      });
      
    }, [timetableCollectionRef, events]);


  const isLoading = !isReady || isUserLoading || areEventsLoading;

  const value: TimetableContextType = {
    events: events || [],
    setEvents,
    addCustomEvents,
    clearEvents,
    isLoading,
  };

  return (
    <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}
