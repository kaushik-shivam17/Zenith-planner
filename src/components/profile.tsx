'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useFirebase, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { Loader2, User } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  class: z.string().optional(),
  height: z.coerce.number().positive('Height must be positive.').optional(),
  weight: z.coerce.number().positive('Weight must be positive.').optional(),
});

type UserProfile = z.infer<typeof profileSchema>;

export function Profile() {
  const { user } = useAuthGuard(true);
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      class: '',
      height: '' as any, // Initialize with empty string
      weight: '' as any, // Initialize with empty string
    },
  });
  
  const { height, weight } = useWatch({ control: form.control });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        ...userProfile,
        height: userProfile.height ?? '',
        weight: userProfile.weight ?? '',
      });
    }
    if (user && !userProfile) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [userProfile, user, form]);

  async function onSubmit(values: UserProfile) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setIsSubmitting(true);
    const dataToSave = {
      ...values,
      id: user.uid,
      updatedAt: serverTimestamp(),
    };
    
    setDocumentNonBlocking(doc(firestore, 'users', user.uid), dataToSave, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved.',
    });
    setIsSubmitting(false);
  }
  
  const bmi =
    height && weight && Number(height) > 0
      ? (Number(weight) / (Number(height) * Number(height))).toFixed(2)
      : null;


  if (isProfileLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary" />
            <span>My Profile</span>
          </CardTitle>
          <CardDescription>View and edit your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" readOnly disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grade 12" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (m)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {bmi && (
                  <div className="flex items-center p-4 rounded-md bg-secondary">
                    <p className="text-sm font-medium text-foreground">
                      Your calculated BMI is: <strong className="text-primary">{bmi}</strong>
                    </p>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
