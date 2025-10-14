'use client';
import { useState } from 'react';
import { BrainCircuit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/use-tasks';
import { generateTimetableAction } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formSchema = z.object({
  customEvents: z.array(z.object({
    title: z.string().min(1),
    day: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
  })),
});

type TimetableEvent = {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'custom' | 'task';
};

export function Timetable() {
  const { tasks } = useTasks();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<TimetableEvent[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customEvents: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customEvents',
  });

  const getGridPosition = (event: TimetableEvent) => {
    const dayIndex = days.indexOf(event.day);
    const startTimeIndex = timeSlots.indexOf(event.startTime);
    const endTimeIndex = timeSlots.indexOf(event.endTime);

    if (dayIndex === -1 || startTimeIndex === -1 || endTimeIndex === -1) {
      return {};
    }

    return {
      gridColumnStart: dayIndex + 2,
      gridRowStart: startTimeIndex + 2,
      gridRowEnd: endTimeIndex + 2,
    };
  };

  const handleGenerateTimetable = async () => {
    setIsLoading(true);
    const customEvents = form.getValues('customEvents');
    const result = await generateTimetableAction({ tasks, customEvents });
    if (result.success && result.data) {
      const taskEvents: TimetableEvent[] = result.data.timetable.map(item => ({...item, type: 'task' as 'task'}));
      const customEventsForState: TimetableEvent[] = customEvents.map(item => ({...item, type: 'custom' as 'custom'}));
      setEvents([...taskEvents, ...customEventsForState]);
      toast({
        title: 'Timetable Generated',
        description: 'Your AI-powered timetable is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Schedule</CardTitle>
          <CardDescription>Add your fixed classes or appointments before generating your AI study schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`customEvents.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Math Class" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customEvents.${index}.day`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                          <SelectContent>{days.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customEvents.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                          <SelectContent>{timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customEvents.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                          <SelectContent>{timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => append({ title: '', day: '', startTime: '', endTime: '' })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Your Weekly Timetable</CardTitle>
            <CardDescription>AI-generated study blocks and your custom events.</CardDescription>
          </div>
          <Button onClick={handleGenerateTimetable} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            Generate AI Timetable
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[600px]">
            <div className="grid grid-cols-[auto,repeat(7,1fr)] grid-rows-[auto,repeat(13,1fr)] gap-px bg-border relative">
              {/* Time slots column */}
              {timeSlots.map((time, index) => (
                <div key={time} className="row-start-2 row-span-1 p-2 text-xs text-center bg-card text-muted-foreground" style={{ gridRow: `${index + 2}` }}>
                  {time}
                </div>
              ))}
              {/* Day headers */}
              {days.map((day, index) => (
                <div key={day} className="col-start-2 col-span-1 p-2 text-sm font-semibold text-center bg-card" style={{ gridColumn: `${index + 2}` }}>
                  {day}
                </div>
              ))}
              
              {/* Grid cells */}
              {Array.from({ length: timeSlots.length * days.length }).map((_, index) => {
                const dayIndex = index % days.length;
                const timeIndex = Math.floor(index / days.length);
                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className="bg-card"
                    style={{ gridColumn: dayIndex + 2, gridRow: timeIndex + 2 }}
                  />
                );
              })}
              
              {/* Events */}
              {events.map((event, index) => (
                <div
                  key={index}
                  style={getGridPosition(event)}
                  className={`p-2 rounded-lg text-white text-xs overflow-hidden flex flex-col ${event.type === 'custom' ? 'bg-secondary' : 'bg-primary'}`}
                >
                  <span className="font-bold">{event.title}</span>
                  <span className="opacity-80">{event.startTime} - {event.endTime}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
