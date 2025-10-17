'use client';
import { useState } from 'react';
import { ListTodo, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useTimetable } from '@/hooks/use-timetable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const formSchema = z.object({
  customEvents: z.array(eventSchema),
});


export function ScheduleManager() {
  const { events, addCustomEvents, clearEvents, isLoading } = useTimetable();
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
    clearEvents('custom'); // This is not ideal as it clears all custom events. `useTimetable` needs `deleteEvent`
    const eventToDelete = customEvents.find(e => e.id === eventId);
    const remainingEvents = customEvents.filter(e => e.id !== eventId);
    if(eventToDelete) {
        addCustomEvents(remainingEvents.map(e => ({...e, type: 'custom'})));
         toast({
          title: 'Event Removed',
        });
    }
  };


  return (
    <div className="space-y-6 fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ListTodo /> <span>Manage Schedule</span></CardTitle>
            <CardDescription>Add, view, and remove your fixed classes and appointments.</CardDescription>
          </div>
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Event
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
        </CardHeader>
        <CardContent>
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
                <ScrollArea className="h-[60vh] pr-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
