'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeartPulse, Loader2, Sparkles } from 'lucide-react';
import { doc } from 'firebase/firestore';

import { getFitnessAdviceAction } from '@/app/actions';
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
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Stopwatch } from './stopwatch';

const formSchema = z.object({
  prompt: z.string().min(10, 'Please enter at least 10 characters.'),
});

// This is the shape of the data coming from Firestore, with height in meters.
type UserProfile = {
  height?: number; // meters
  weight?: number;
};

export function FitnessMentor() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard(true);
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAdvice(null);
    
    let bmi: number | undefined = undefined;
    // userProfile.height is in meters
    if (userProfile?.height && userProfile?.weight) {
      if (userProfile.height > 0) {
        bmi = userProfile.weight / (userProfile.height * userProfile.height);
      }
    }
    
    const result = await getFitnessAdviceAction(values.prompt, bmi);

    if (result.success && result.data) {
      setAdvice(result.data.advice);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsLoading(false);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="text-primary" />
            <span>Workout Timer</span>
          </CardTitle>
          <CardDescription>
            Use the stopwatch to time your exercises and rest periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stopwatch />
        </CardContent>
      </Card>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="text-primary" />
                <span>AI Fitness Mentor</span>
              </CardTitle>
              <CardDescription>
                Ask for fitness tips, workout ideas, or nutrition advice. Your BMI will be automatically included for more personalized advice if available on your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How can I help you today?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'What are some good exercises for beginners?' or 'How can I improve my cardio?'"
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Advice
              </Button>
              {advice && (
                <div className="p-4 rounded-md bg-secondary/50 w-full space-y-2 border">
                  <div className="text-sm text-primary flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <strong className="text-accent">AI Fitness Mentor:</strong>
                      <div
                          className="prose prose-sm prose-invert max-w-none mt-1 whitespace-pre-wrap"
                        >
                        {advice}
                      </div>
                    </div>
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
