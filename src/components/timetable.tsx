'use client';
import { useState } from 'react';
import { BrainCircuit, ListTodo, Loader2, Plus, Trash2, Calendar, Clock, Zap, Activity, Cpu, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { generateTimetable } from '@/lib/ai';
import { ScrollArea } from './ui/scroll-area';
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
import { useData } from '@/context/data-provider';


const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const preferencesSchema = z.object({
  studyTime: z.string().min(1, "Preferred session time required."),
  energyLevel: z.string().min(1, "Typical biometric pattern required."),
  sessionLength: z.string().min(1, "Target focus duration required."),
  extraInfo: z.string().optional(),
});


const eventSchema = z.object({
    title: z.string().min(1, "Event identifier required."),
    day: z.string().min(1, "Temporal node required."),
    startTime: z.string().min(1, "Activation time required."),
    endTime: z.string().min(1, "Termination time required."),
  }).refine(
    (event) => {
        const startIndex = timeSlots.indexOf(event.startTime);
        const endIndex = timeSlots.indexOf(event.endTime);
        return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    },
    {
      message: 'Termination sequence must follow activation.',
      path: ['endTime'],
    }
  );

type ScheduleManagerDialogProps = {
    events: TimetableEvent[];
    addCustomEvents: (events: Omit<TimetableEvent, 'id' | 'userId' | 'type'>[]) => Promise<void>;
    deleteCustomEvent: (eventId: string) => Promise<void>;
    isLoading: boolean;
}

function ScheduleManagerDialog({ events, addCustomEvents, deleteCustomEvent, isLoading}: ScheduleManagerDialogProps) {
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
      title: 'FIXED_NODE_LOCKED',
      description: `${values.title} added to the grid.`,
    });
    form.reset();
    setIsAddOpen(false);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    deleteCustomEvent(eventId);
    toast({
      title: 'NODE_DISCONNECTED',
    });
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 font-mono text-[10px] tracking-widest uppercase">
             <ListTodo className="mr-2 h-3.5 w-3.5" /> MANAGE_GRID
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl tracking-tighter text-primary glow-primary uppercase">STATIC_NODES_MANAGER</DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase opacity-70">Inject or terminate fixed temporal coordinates.</DialogDescription>
          </DialogHeader>
          
           {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary glow-primary" />
                </div>
            ) : customEvents.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 border border-dashed border-primary/10 rounded-xl bg-primary/5">
                    <ListTodo className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-4 text-[10px] font-mono uppercase tracking-widest opacity-40">No static nodes detected.</p>
                </div>
            ) : (
                <ScrollArea className="h-[250px] pr-4 pt-4">
                    <div className="space-y-3">
                    {customEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-primary/5 group hover:border-primary/30 transition-all">
                            <div>
                                <p className="font-mono font-bold text-primary glow-primary text-sm uppercase">{event.title}</p>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1 tracking-tighter">{event.day} // {event.startTime} - {event.endTime}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                                onClick={() => handleDeleteEvent(event.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="cyber-button bg-primary text-black font-mono font-bold mt-4">
                <Plus className="mr-2 h-4 w-4" /> INJECT_FIXED_NODE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
              <DialogHeader>
                <DialogTitle className="font-mono text-xl tracking-tighter text-primary glow-primary uppercase">NODE_PARAMETERS_INIT</DialogTitle>
                <DialogDescription className="text-xs font-mono uppercase opacity-70">
                  Input temporal data for new static sequence.
                </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                   <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Node_Identifier</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., CORE_LEVEL_LECTURE" className="bg-black/40 border-primary/20 font-mono" />
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
                        <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Target_Cycle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono"><SelectValue placeholder="SELECT_DAY" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card border-primary/20 font-mono">{days.map(day => <SelectItem key={day} value={day}>{day.toUpperCase()}</SelectItem>)}</SelectContent>
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
                          <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Activation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono text-[10px]"><SelectValue placeholder="TIME" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-card border-primary/20 font-mono">{timeSlots.map(time => <SelectItem key={time} value={time} className="text-[10px]">{time}</SelectItem>)}</SelectContent>
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
                          <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Termination</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono text-[10px]"><SelectValue placeholder="TIME" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-card border-primary/20 font-mono">{timeSlots.slice(1).map(time => <SelectItem key={time} value={time} className="text-[10px]">{time}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full cyber-button bg-primary text-black font-mono font-bold" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    LOCK_SEQUENCE
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
  const { events, setEvents, addCustomEvents, deleteCustomEvent, clearEvents, tasks, isLoading } = useData();
  const { toast } = useToast();
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
            title: 'NO_TASKS_DETECTED',
            description: 'Initialize mission nodes before grid synchronization.',
        });
        setIsGenerating(false);
        return;
    }

    try {
      const result = await generateTimetable({ tasks, customEvents, preferences });
      const taskEvents = result.map((item: any) => ({...item, type: 'task' as 'task'}));
      await setEvents(taskEvents);

      toast({
        title: 'GRID_SYNCHRONIZED',
        description: 'AI strategy has been mapped to the weekly schedule.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'SYNC_FAILURE',
        description: error.message || 'The scheduling algorithm was interrupted.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClearTasks = () => {
    if (confirm('CLEAR STUDY BLOCKS? STATIC NODES WILL REMAIN.')) {
      clearEvents('task');
      toast({ title: 'GRID_FLUSHED', description: 'Dynamic study blocks removed.' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-primary glow-primary" />
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Deciphering_Temporal_Grid...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded border border-primary/30 bg-primary/10 flex items-center justify-center glow-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]">
            <Calendar size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter font-headline glow-primary uppercase">TEMPORAL_SYNC</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mt-1 animate-pulse">WEEKLY_GRID_INTERFACE</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <ScheduleManagerDialog events={events} addCustomEvents={addCustomEvents} deleteCustomEvent={deleteCustomEvent} isLoading={isLoading} />
            
            <Button variant="ghost" onClick={handleClearTasks} className="text-destructive hover:text-destructive hover:bg-destructive/10 font-mono text-[10px] tracking-widest uppercase">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> FLUSH_BLOCKS
            </Button>
            
            <Dialog open={isPrefsOpen} onOpenChange={setIsPrefsOpen}>
              <DialogTrigger asChild>
                  <Button disabled={isGenerating} className="cyber-button bg-primary text-black font-mono font-bold text-xs h-10 px-6">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  INIT_AI_SYNC
                  </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                  <DialogHeader>
                  <DialogTitle className="font-mono text-xl tracking-tighter text-primary glow-primary uppercase">SYNC_PREFERENCES</DialogTitle>
                  <DialogDescription className="text-xs font-mono uppercase opacity-70">
                      Configure algorithm parameters for optimal grid distribution.
                  </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleGenerateTimetable)} className="space-y-6 pt-4">
                      <FormField
                      control={form.control}
                      name="studyTime"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Preferred_Window</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono text-xs"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent className="bg-card border-primary/20 font-mono">
                                <SelectItem value="morning">MORNING_PHASE</SelectItem>
                                <SelectItem value="afternoon">AFTERNOON_PHASE</SelectItem>
                                <SelectItem value="evening">EVENING_PHASE</SelectItem>
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
                          <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Biometric_Peak</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono text-xs"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent className="bg-card border-primary/20 font-mono">
                                <SelectItem value="high-in-morning">HIGHEST_IN_AM</SelectItem>
                                <SelectItem value="energized-after-lunch">POST_MERIDIAN_BOOST</SelectItem>
                                <SelectItem value="night-owl">LATE_CYCLE_FOCUS</SelectItem>
                                <SelectItem value="consistent">STABLE_OSCILLATION</SelectItem>
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
                          <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Focus_Duration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-primary/20 font-mono text-xs"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent className="bg-card border-primary/20 font-mono">
                                <SelectItem value="30-min">FOCUSED (30 MIN)</SelectItem>
                                <SelectItem value="60-min">STANDARD (1 HOUR)</SelectItem>
                                <SelectItem value="90-min">DEEP_SYNC (90 MIN+)</SelectItem>
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
                            <FormLabel className="text-[10px] font-mono uppercase text-primary/60">Directive_Supplementary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., 'PRIORITIZE_MATH_EXAM' or 'NO_DATA_SYNC_ON_SUNDAY'"
                                className="bg-black/40 border-primary/20 font-mono text-xs h-24 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full cyber-button bg-primary text-black font-mono font-bold h-12">
                         <Zap className="mr-2 h-4 w-4" /> GENERATE_GRID_SYNC
                      </Button>
                  </form>
                  </Form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

       <Card className="cyber-card bg-black/40 border-primary/20 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="h-full w-full bg-[linear-gradient(rgba(0,242,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <CardHeader className="bg-primary/5 border-b border-primary/10">
           <div className="flex items-center gap-2">
              <Activity size={14} className="text-primary animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Live_Grid_Monitor</span>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[80px,repeat(7,1fr)] grid-rows-[auto,repeat(13,1fr)] gap-px bg-primary/10">
                {/* Intersection empty cell */}
                <div className="bg-black/40 p-4 border-b border-r border-primary/10" />
                
                {/* Day headers */}
                {days.map((day, index) => (
                  <div key={day} className="p-4 text-[10px] font-mono font-bold text-center bg-primary/5 text-primary glow-primary uppercase tracking-widest border-b border-primary/10">
                    {day}
                  </div>
                ))}
                
                {/* Time slots column */}
                {timeSlots.map((time, index) => (
                  <div key={time} className="p-3 text-[9px] font-mono text-center bg-black/20 text-muted-foreground border-r border-primary/10 flex items-center justify-center">
                    {time}
                  </div>
                ))}
                
                {/* Grid cells */}
                {Array.from({ length: timeSlots.length * days.length }).map((_, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-black/10 border-b border-r border-primary/5 h-[60px]"
                    />
                  );
                })}
                
                {/* Events */}
                {events.map((event, index) => (
                  <div
                    key={event.id || index}
                    style={getGridPosition(event)}
                    className={`m-1 p-2 rounded-lg text-xs overflow-hidden flex flex-col border shadow-lg transition-all hover:scale-[1.02] hover:z-10 ${
                      event.type === 'custom' 
                        ? 'bg-secondary/40 border-secondary-foreground/20 text-secondary-foreground' 
                        : 'bg-primary/20 border-primary/40 text-primary glow-primary'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                       {event.type === 'custom' ? <Clock size={10} /> : <Zap size={10} />}
                       <span className="font-mono font-bold text-[10px] uppercase truncate">{event.title}</span>
                    </div>
                    <span className="text-[8px] font-mono opacity-60 truncate uppercase">{event.startTime} - {event.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-4 text-primary/40 px-2">
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
            <span className="text-[9px] font-mono tracking-widest uppercase">DYNAMIC_STUDY_BLOCK</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary border border-primary/20" />
            <span className="text-[9px] font-mono tracking-widest uppercase">STATIC_NODE</span>
         </div>
      </div>
    </div>
  );
}
