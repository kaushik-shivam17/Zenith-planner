'use client';

import { useCallback, useState, useEffect } from 'react';
import type { TimetableEvent } from '@/lib/types';
import { blink } from '@/blink/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TimetableHook {
  events: TimetableEvent[];
  setEvents: (events: Omit<TimetableEvent, 'id' | 'userId'>[]) => Promise<void>;
  addCustomEvents: (events: Omit<TimetableEvent, 'id' | 'userId' | 'type'>[]) => Promise<void>;
  deleteCustomEvent: (eventId: string) => Promise<void>;
  clearEvents: (type: 'task' | 'custom' | 'all') => Promise<void>;
  isLoading: boolean;
}

export function useTimetable(): TimetableHook {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [events, setEventsState] = useState<TimetableEvent[]>([]);
  const [areEventsLoading, setAreEventsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEventsState([]);
      setAreEventsLoading(false);
      return;
    }

    try {
      const { data } = await blink.db.timetable_events.list({
        where: { userId: user.id }
      });
      setEventsState((data || []) as TimetableEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setAreEventsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const setEvents = useCallback(async (newEvents: Omit<TimetableEvent, 'id' | 'userId'>[]) => {
    if (!user) return;
    try {
      // Clear existing first
      const { data: existing } = await blink.db.timetable_events.list({ where: { userId: user.id } });
      if (existing) {
        for (const e of existing) {
          await blink.db.timetable_events.delete(e.id);
        }
      }

      // Add new
      for (const event of newEvents) {
        await blink.db.timetable_events.create({
          id: crypto.randomUUID(),
          userId: user.id,
          ...event,
          createdAt: new Date().toISOString()
        });
      }
      await fetchEvents();
      toast({ title: 'Schedule Updated', description: 'Timetable synchronized.' });
    } catch (error) {
      console.error('Error setting events:', error);
    }
  }, [user, fetchEvents]);

  const addCustomEvents = useCallback(async (customEvents: Omit<TimetableEvent, 'id' | 'userId' | 'type'>[]) => {
    if (!user) return;
    try {
      for (const event of customEvents) {
        await blink.db.timetable_events.create({
          id: crypto.randomUUID(),
          userId: user.id,
          ...event,
          type: 'custom',
          createdAt: new Date().toISOString()
        });
      }
      await fetchEvents();
    } catch (error) {
      console.error('Error adding custom events:', error);
    }
  }, [user, fetchEvents]);

  const deleteCustomEvent = useCallback(async (eventId: string) => {
    if (!user) return;
    try {
      await blink.db.timetable_events.delete(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [user, fetchEvents]);

  const clearEvents = useCallback(async (type: 'task' | 'custom' | 'all') => {
    if (!user) return;
    try {
      const { data: existing } = await blink.db.timetable_events.list({ where: { userId: user.id } });
      if (existing) {
        for (const e of existing) {
          if (type === 'all' || e.type === type) {
            await blink.db.timetable_events.delete(e.id);
          }
        }
      }
      await fetchEvents();
      toast({ title: 'Schedule Cleared', description: 'Timetable data purged.' });
    } catch (error) {
      console.error('Error clearing events:', error);
    }
  }, [user, fetchEvents]);

  const isLoading = isAuthLoading || areEventsLoading;

  return {
    events,
    setEvents,
    addCustomEvents,
    deleteCustomEvent,
    clearEvents,
    isLoading,
  };
}
