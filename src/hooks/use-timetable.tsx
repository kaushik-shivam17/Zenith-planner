
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const timetableCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'timetableEvents') : null),
    [user, firestore]
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
      const batch = writeBatch(firestore);

      customEvents.forEach(event => {
        const newEventRef = doc(timetableCollectionRef);
        const eventWithUser = { ...event, id: newEventRef.id, userId: user.uid, type: 'custom' as 'custom' };
        batch.set(newEventRef, eventWithUser);
      });
      
      await batch.commit();
  }, [timetableCollectionRef, user, firestore]);

  const clearEvents = useCallback(async (type: 'task' | 'custom' | 'all') => {
      if (!timetableCollectionRef || !events) return;
      const batch = writeBatch(firestore);
      
      events.forEach(event => {
        if (type === 'all' || event.type === type) {
          const eventDocRef = doc(timetableCollectionRef, event.id);
          batch.delete(eventDocRef);
        }
      });
      
      await batch.commit();
    }, [timetableCollectionRef, firestore, events]);


  const isLoading = !isClient || isUserLoading || areEventsLoading;

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
