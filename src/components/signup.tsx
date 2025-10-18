'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, auth } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Firebase is not ready. Please try again in a moment.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create a user document in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const newUserProfile = {
        id: user.uid,
        email: user.email,
        name: values.name,
        updatedAt: serverTimestamp(),
      };
      
      // Use the non-blocking write with error handling
      setDocumentNonBlocking(userDocRef, newUserProfile, { merge: false });
      
      toast({
        title: 'Account Created!',
        description: 'Welcome! You can now use the app.',
      });
      router.push('/dashboard'); 
    } catch (error: any) {
      console.error('Signup error', error);
       let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'This email is already in use. Please log in instead.';
            break;
          case 'auth/weak-password':
            description = 'The password is too weak. Please use at least 6 characters.';
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Sign up to start planning with Zenith.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., John Doe"
                        {...field}
                      />
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
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
