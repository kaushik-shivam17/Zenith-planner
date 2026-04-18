'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Zap, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Protocol ID too short (min 2).'),
  description: z.string().optional(),
  deadline: z.date({
    required_error: 'Mission deadline required.',
  }),
});

type TaskFormValues = z.infer<typeof formSchema>;

type TaskFormProps = {
  onAddTask: (taskData: TaskFormValues) => Promise<void>;
  selectedDate?: Date;
};

export function TaskForm({ onAddTask, selectedDate }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: selectedDate,
    },
  });

  useEffect(() => {
    if (selectedDate) {
      form.setValue('deadline', selectedDate);
    }
  }, [selectedDate, form]);

  async function onSubmit(values: TaskFormValues) {
    await onAddTask(values);
    form.reset({ title: '', description: '', deadline: selectedDate || new Date() });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Mission_Objective</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., QUANTUM_ALGORITHM_INIT" 
                  className="bg-black/40 border-primary/20 focus:border-primary/60 font-mono text-sm h-12"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-[10px] font-mono text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Protocol_Data (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Inject supplementary mission parameters..."
                  className="bg-black/40 border-primary/20 focus:border-primary/60 font-mono text-xs h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-mono text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Expiration_Timer</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-mono text-xs h-10 bg-black/40 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd_MM_yyyy')
                      ) : (
                        <span className="uppercase tracking-widest opacity-40">SELECT_DATE_CODE</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 text-primary opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-primary/20 cyber-card" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                    className="font-mono p-4"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-[10px] font-mono text-destructive" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full cyber-button bg-primary text-black font-mono font-bold text-xs h-12 hover:bg-primary/90">
          <ShieldCheck className="mr-2 h-4 w-4" />
          AUTHORIZE_TASK
        </Button>
      </form>
    </Form>
  );
}
