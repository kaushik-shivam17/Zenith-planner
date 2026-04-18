'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, ShieldCheck, Zap } from 'lucide-react';
import { blink } from '@/blink/client';

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

const formSchema = z.object({
  email: z.string().email('Invalid access identifier.'),
  password: z.string().min(6, 'Security key too short.'),
});

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await blink.auth.signInWithEmail(values.email, values.password);
      toast({
        title: 'ACCESS_GRANTED',
        description: 'System synchronization established.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error', error);
      toast({
        variant: 'destructive',
        title: 'AUTH_FAILED',
        description: error.message || 'Invalid credentials or system rejection.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm cyber-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <ShieldCheck className="text-primary h-12 w-12" />
        </div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-mono tracking-tighter glow-primary">
                AUTH_PROTOCOL
              </CardTitle>
              <CardDescription className="text-xs font-mono uppercase opacity-70">
                Identify yourself to bypass security barriers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-mono tracking-widest opacity-60">System ID</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@network.net"
                        className="bg-black/40 border-primary/20 focus:border-primary/60 font-mono transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-mono" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-mono tracking-widest opacity-60">Access Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-black/40 border-primary/20 focus:border-primary/60 font-mono transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-mono" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4 pb-8">
              <Button type="submit" className="w-full cyber-button bg-primary text-black hover:bg-primary/90 font-mono font-bold" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                ESTABLISH_LINK
              </Button>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
                New entity detected?{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:glow-primary transition-all underline decoration-primary/30"
                >
                  Register Node
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
