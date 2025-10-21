'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/context/data-provider';
import { useToast } from '@/hooks/use-toast';
import { isToday, differenceInMinutes, parse, getDay, isSameDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


const DAY_MAP: { [key: string]: number } = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

export function NotificationManager() {
  const { tasks, events, isLoading } = useData();
  const { toast } = useToast();
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) return;

    const checkNotifications = () => {
      const now = new Date();

      // Check for upcoming tasks due today
      tasks.forEach(task => {
        const taskId = `task-${task.id}`;
        // The deadline can be a Date object or a Firestore Timestamp object
        const deadlineDate = task.deadline instanceof Timestamp ? task.deadline.toDate() : task.deadline;
        
        if (!task.completed && isToday(deadlineDate) && !notifiedIds.has(taskId)) {
          toast({
            title: 'Task Reminder: Due Today!',
            description: `Your task "${task.title}" is due today.`,
          });
          setNotifiedIds(prev => new Set(prev).add(taskId));
        }
      });

      // Check for upcoming timetable events
      events.forEach(event => {
        const eventId = `event-${event.id}`;
        const eventDayIndex = DAY_MAP[event.day];
        const todayIndex = getDay(now);

        // Check if the event is today
        if (eventDayIndex === todayIndex && !notifiedIds.has(eventId)) {
          // Parse the event's start time for today's date
          const eventStartTime = parse(event.startTime, 'h:mm a', now);
          
          // Ensure parsing was successful before proceeding
          if (!isNaN(eventStartTime.getTime())) {
            const minutesUntilEvent = differenceInMinutes(eventStartTime, now);
            
            // Notify if the event is between 0 and 30 minutes away
            if (minutesUntilEvent > 0 && minutesUntilEvent <= 30) {
              toast({
                title: 'Upcoming Event Reminder',
                description: `Your event "${event.title}" starts at ${event.startTime}.`,
              });
              setNotifiedIds(prev => new Set(prev).add(eventId));
            }
          }
        }
      });
    };

    // Run once on load and then set an interval to check every minute
    checkNotifications();
    const intervalId = setInterval(checkNotifications, 60000); // 60,000 ms = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);

  }, [tasks, events, isLoading, toast, notifiedIds]);

  // This component doesn't render anything visible in the UI
  return null;
}
