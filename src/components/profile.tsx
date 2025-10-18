'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { updatePassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';


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
import { Loader2, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { setDocument } from '@/firebase/non-blocking-updates';


const profileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  class: z.string().optional(),
  height: z.coerce.number().positive('Height must be positive.').optional(),
  weight: z.coerce.number().positive('Weight must be positive.').optional(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type UserProfile = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// This is the type that will be stored in Firestore, with height in meters
type UserProfileFirestore = Omit<UserProfile, 'height'> & { height?: number };

type BmiResult = {
  value: string;
  status: 'Underweight' | 'Normal' | 'Overweight';
  color: string;
  label: string;
};


export function Profile() {
  const { user, auth } = useAuthGuard(true);
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  // We fetch data that has height in meters
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfileFirestore>(userDocRef);

  const form = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      name: '',
      class: '',
      height: undefined, // cm
      weight: undefined,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });
  


  useEffect(() => {
    if (userProfile) {
      form.reset({
        email: userProfile.email ?? user?.email ?? '',
        name: userProfile.name ?? user?.displayName ?? '',
        class: userProfile.class ?? '',
        // Convert height from meters (Firestore) to cm (UI)
        height: userProfile.height ? userProfile.height * 100 : undefined,
        weight: userProfile.weight ?? undefined,
      });
    } else if (user) {
      form.setValue('email', user.email || '');
      form.setValue('name', user.displayName || '');
    }
  }, [userProfile, user, form]);

  async function onSubmit(values: UserProfile) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setIsSubmitting(true);
    
    // Convert height from cm (UI) to meters for Firestore
    const heightInMeters = values.height ? values.height / 100 : undefined;

    const finalData = {
      ...values,
      height: heightInMeters,
      updatedAt: serverTimestamp(),
    }


    const docRef = doc(firestore, 'users', user.uid);
    
    setDocument(docRef, finalData, { merge: true });

    toast({
      title: 'Profile Update Saving',
      description: 'Your changes are being saved in the background.',
    });
    
    setIsSubmitting(false);
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    if (!user || !auth?.currentUser) return;
    setIsPasswordSubmitting(true);
    try {
      await updatePassword(auth.currentUser, values.newPassword);
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      console.error('Password update error', error);
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/requires-recent-login') {
          description = 'This action is sensitive and requires recent authentication. Please log out and log back in to change your password.';
        } else {
          description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: description,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  const handleCalculateBmi = () => {
    const { height, weight } = form.getValues();
  
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
      
      let status: BmiResult['status'];
      let color: string;
      let label: string;

      if (bmiValue < 18.5) {
        status = 'Underweight';
        color = 'text-yellow-500';
        label = 'BMI is low';
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        status = 'Normal';
        color = 'text-green-500';
        label = 'BMI is good';
      } else {
        status = 'Overweight';
        color = 'text-red-500';
        label = 'BMI is high';
      }

      setBmiResult({
        value: bmiValue.toString(),
        status,
        color,
        label
      });

    } else {
      setBmiResult(null);
      toast({
        variant: 'destructive',
        title: 'Missing or Invalid Information',
        description: 'Please enter a valid height and weight greater than zero to calculate BMI.',
      });
    }
  };
  


  if (isProfileLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  

  return (
    <div className="space-y-6 fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="text-primary" />
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
                        <Input placeholder="e.g., Jane Doe" {...field} />
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
                        <Input placeholder="e.g., class 11th" {...field} value={field.value ?? ''} />
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
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 175"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : parseFloat(value));
                            setBmiResult(null);
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : parseFloat(value));
                            setBmiResult(null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {bmiResult && (
                  <div className="flex items-center p-4 rounded-md bg-secondary sm:col-span-2">
                    <p className="text-sm font-medium text-foreground">
                      Your calculated BMI is: <strong className={bmiResult.color}>{bmiResult.value}</strong>
                      <span className={`ml-2 font-semibold ${bmiResult.color}`}>({bmiResult.label})</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Your Password</DialogTitle>
                      <DialogDescription>
                        Enter a new password below.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={isPasswordSubmitting}>
                            {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                 <Button type="button" variant="secondary" onClick={handleCalculateBmi}>
                  Check BMI
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
