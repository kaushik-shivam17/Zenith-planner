'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeartPulse, Loader2, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

import { getFitnessAdvice } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Stopwatch } from './stopwatch';

const formSchema = z.object({
  prompt: z.string().min(10, 'Mission parameters too short (min 10 characters).'),
});

type FitnessAdvice = {
  workout: string;
  nutrition: string;
  recovery: string;
  biometricTip: string;
};

export function FitnessMentor() {
  const [advice, setAdvice] = useState<FitnessAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAdvice(null);
    
    try {
      const result = await getFitnessAdvice(values.prompt);
      setAdvice(result);
      toast({ title: 'BIO_SYNC_ESTABLISHED', description: 'Optimal performance protocol generated.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'SYNC_ERROR',
        description: error.message || 'Failed to communicate with Fitness Core.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Activity className="text-primary h-8 w-8 glow-primary" />
        <h1 className="text-4xl font-bold tracking-tighter font-headline glow-primary uppercase">
          BIO_SYNC_MANDATE
        </h1>
      </div>

      <Card className="cyber-card bg-black/40 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Activity size={120} />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-mono tracking-tighter glow-primary uppercase">
            <ShieldCheck size={20} />
            <span>SESSION_CHRONO</span>
          </CardTitle>
          <CardDescription className="text-xs font-mono uppercase opacity-70">
            Time your exertion phases and tactical recovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12 bg-primary/5 border-y border-primary/10">
          <Stopwatch />
        </CardContent>
      </Card>

      <Card className="cyber-card bg-black/40 border-accent/20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent font-mono tracking-tighter glow-accent uppercase">
                <Sparkles size={20} />
                <span>BIO_HACK_MENTOR</span>
              </CardTitle>
              <CardDescription className="text-xs font-mono uppercase opacity-70">
                Input your physical objective for AI biomechanical optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-mono tracking-widest text-accent/60">Objective Input</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'OPTIMIZE_CORE_STRENGTH' or 'MAXIMIZE_NEURO_RECOVERY'"
                        className="bg-black/60 border-accent/20 focus:border-accent/60 font-mono text-xs h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-mono text-destructive" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-8 pb-10">
              <Button type="submit" disabled={isLoading} className="cyber-button bg-accent text-black font-mono font-bold hover:bg-accent/90 w-full sm:w-auto px-10">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                INITIATE_BIO_SYNC
              </Button>

              {advice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 relative overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={40} className="text-primary" />
                    </div>
                    <h4 className="text-[10px] font-mono tracking-widest text-primary uppercase">Physical_Protocol</h4>
                    <p className="text-xs font-mono leading-relaxed">{advice.workout}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2 relative overflow-hidden group hover:border-accent/40 transition-all">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Activity size={40} className="text-accent" />
                    </div>
                    <h4 className="text-[10px] font-mono tracking-widest text-accent uppercase">Fuel_Optimization</h4>
                    <p className="text-xs font-mono leading-relaxed">{advice.nutrition}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-2 relative overflow-hidden group hover:border-primary/20 transition-all">
                    <h4 className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">System_Maintenance</h4>
                    <p className="text-xs font-mono leading-relaxed">{advice.recovery}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/40 space-y-2 relative overflow-hidden group shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                    <h4 className="text-[10px] font-mono tracking-widest text-primary glow-primary uppercase">Bio_Hack_Directive</h4>
                    <p className="text-xs font-mono font-bold leading-relaxed">{advice.biometricTip}</p>
                  </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
