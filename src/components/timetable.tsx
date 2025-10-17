'use client';
import { useState } from 'react';
import { BrainCircuit, ListTodo, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/use-tasks';
import { generateTimetableAction } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import { useTimetable } from '@/hooks/use-timetable';
import type { TimetableEvent } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';


const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const preferencesSchema = z.object({
  studyTime: z.string().min(1, "Please select your preferred study time."),
  energyLevel: z.string().min(1, "Please select your typical energy level pattern."),
  sessionLength: z.string().min(1, "Please select your preferred session length."),
  extraInfo: z.string().optional(),
});


const eventSchema = z.object({
    title: z.string().min(1, "Title is required."),
    day: z.string().min(1, "Day is required."),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required."),
  }).refine(
    (event) => {
        const startIndex = timeSlots.indexOf(event.startTime);
        const endIndex = timeSlots.indexOf(event.endTime);
        return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    },
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  );


function ScheduleManagerDialog() {
  const { events, addCustomEvents, deleteCustomEvent, isLoading } = useTimetable();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      day: '',
      startTime: '',
      endTime: '',
    },
  });

  const customEvents = events.filter(e => e.type === 'custom');

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    await addCustomEvents([{...values, type: 'custom'}]);
    toast({
      title: 'Event Added',
      description: `${values.title} has been added to your schedule.`,
    });
    form.reset();
    setIsAddOpen(false);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    deleteCustomEvent(eventId);
    toast({
      title: 'Event Removed',
    });
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline"><ListTodo className="mr-2 h-4 w-4" /> Manage Schedule</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Schedule</DialogTitle>
            <DialogDescription>Add, view, and remove your fixed classes and appointments.</DialogDescription>
          </DialogHeader>
          
           {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : customEvents.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <ListTodo className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Scheduled Events</h3>
                    <p className="mt-1 text-sm">Add a class or appointment to get started.</p>
                </div>
            ) : (
                <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                    {customEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 rounded-md border group">
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.day}, {event.startTime} - {event.endTime}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100"
                                onClick={() => handleDeleteEvent(event.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Scheduled Event</DialogTitle>
                <DialogDescription>
                  Enter the details for your class or appointment.
                </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                   <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Math Class" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                          <SelectContent>{days.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                            <SelectContent>{timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
                          </Select>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                            <SelectContent>{timeSlots.slice(1).map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Event
                  </Button>
                </form>
               </Form>
            </DialogContent>
          </Dialog>

        </DialogContent>
    </Dialog>
  )
}


export function Timetable() {
  const router = useRouter();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const { events, setEvents, isLoading: isTimetableLoading, clearEvents } = useTimetable();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      studyTime: 'afternoon',
      energyLevel: 'consistent',
      sessionLength: '60-min',
      extraInfo: '',
    },
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

  const handleGenerateTimetable = async (preferences: z.infer<typeof preferencesSchema>) => {
    setIsGenerating(true);
    setIsPrefsOpen(false);
    const customEvents = events.filter(e => e.type === 'custom');
    
    if (tasks.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No tasks to schedule',
            description: 'Please add some tasks in the Tasks page before generating a timetable.',
        });
        setIsGenerating(false);
        return;
    }

    const result = await generateTimetableAction({ tasks, customEvents, preferences });
    if (result.success && result.data) {
      const taskEvents = result.data.timetable.map(item => ({...item, type: 'task' as 'task'}));
      const customEventsToKeep = events.filter(e => e.type === 'custom');
      const newEventList = [...customEventsToKeep, ...taskEvents];
      
      await setEvents(newEventList);

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
    setIsGenerating(false);
  };
  
  const handleClearTasks = () => {
    clearEvents('task');
    toast({ title: 'Study blocks cleared from timetable.' });
  }

  return (
    <div className="space-y-6 fade-in">
       <Card>
        <CardHeader>
            <div className='flex items-center justify-between'>
                <div>
                    <CardTitle>Your Weekly Timetable</CardTitle>
                    <CardDescription>
                    AI-generated study blocks and your custom events.
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <ScheduleManagerDialog />
                    <Button variant="outline" onClick={handleClearTasks}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Study Blocks
                    </Button>
                    <Dialog open={isPrefsOpen} onOpenChange={setIsPrefsOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        Generate AI Timetable
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Personalize Your Timetable</DialogTitle>
                        <DialogDescription>
                            Answer a few questions to help the AI create the best schedule for you.
                        </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleGenerateTimetable)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="studyTime"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>When do you prefer to study?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                    <SelectItem value="morning">Morning</SelectItem>
                                    <SelectItem value="afternoon">Afternoon</SelectItem>
                                    <SelectItem value="evening">Evening</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="energyLevel"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>What are your energy levels like?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                    <SelectItem value="high-in-morning">Highest in the morning</SelectItem>
                                    <SelectItem value="energized-after-lunch">I get a boost after lunch</SelectItem>
                                    <SelectItem value="night-owl">I'm most focused at night</SelectItem>
                                    <SelectItem value="consistent">Pretty consistent all day</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="sessionLength"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>How long do you like your study sessions?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                    <SelectItem value="30-min">Short and focused (30 min)</SelectItem>
                                    <SelectItem value="60-min">Standard (1 hour)</SelectItem>
                                    <SelectItem value="90-min">Long and deep (90 min+)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                              control={form.control}
                              name="extraInfo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Information (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="e.g., 'I have a big exam for Math on Friday' or 'Don't schedule anything on Saturday evening.'"
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                            Generate My Timetable
                            </Button>
                        </form>
                        </Form>
                    </DialogContent>
                    </Dialog>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[600px]">
            {isTimetableLoading ? (
               <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : (
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
                    key={event.id || index}
                    style={getGridPosition(event)}
                    className={`p-2 rounded-lg text-white text-xs overflow-hidden flex flex-col ${event.type === 'custom' ? 'bg-secondary' : 'bg-primary'}`}
                  >
                    <span className="font-bold">{event.title}</span>
                    <span className="opacity-80">{event.startTime} - {event.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
