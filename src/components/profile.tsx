'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

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
import { Loader2, User as UserIcon, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const profileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Identifier too short (min 2)."),
  class: z.string().optional(),
  height: z.coerce.number().positive('Height must be positive.').optional(),
  weight: z.coerce.number().positive('Weight must be positive.').optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current security key required.'),
  newPassword: z.string().min(6, 'New security key must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Security keys do not match.',
  path: ['confirmPassword'],
});

type UserProfileValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type BmiResult = {
  value: string;
  status: 'Underweight' | 'Normal' | 'Overweight';
  color: string;
  label: string;
};

export function Profile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const form = useForm<UserProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      name: '',
      class: '',
      height: undefined,
      weight: undefined,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await blink.db.user_profiles.list({
        where: { userId: user.id }
      });
      
      const profile = data?.[0];
      if (profile) {
        form.reset({
          email: user.email || '',
          name: profile.name || user.displayName || '',
          class: profile.class || '',
          height: profile.height ? profile.height * 100 : undefined,
          weight: profile.weight ?? undefined,
        });
      } else {
        form.reset({
          email: user.email || '',
          name: user.displayName || '',
          class: '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [user, form]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  async function onSubmit(values: UserProfileValues) {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const heightInMeters = values.height ? values.height / 100 : undefined;
      
      const { data: existing } = await blink.db.user_profiles.list({
        where: { userId: user.id }
      });

      if (existing?.[0]) {
        await blink.db.user_profiles.update({
          id: existing[0].id,
          name: values.name,
          class: values.class,
          height: heightInMeters,
          weight: values.weight,
          updatedAt: new Date().toISOString()
        });
      } else {
        await blink.db.user_profiles.create({
          id: crypto.randomUUID(),
          userId: user.id,
          name: values.name,
          class: values.class,
          height: heightInMeters,
          weight: values.weight,
          updatedAt: new Date().toISOString()
        });
      }

      toast({
        title: 'DATA_SYNCHRONIZED',
        description: 'Biometric profile has been updated in the mainframe.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'SYNC_FAILURE',
        description: error.message || 'Failed to update user node.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsPasswordSubmitting(true);
    try {
      await blink.auth.changePassword(values.oldPassword, values.newPassword);
      toast({
        title: 'SECURITY_KEY_UPDATED',
        description: 'Access credentials have been successfully rotated.',
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AUTH_OVERRIDE_FAILED',
        description: error.message || 'Verification failed. Protocol rejected.',
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
        color = 'text-yellow-400';
        label = 'UNDER_OPTIMAL';
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        status = 'Normal';
        color = 'text-primary';
        label = 'OPTIMAL_RANGE';
      } else {
        status = 'Overweight';
        color = 'text-accent';
        label = 'OVER_THRESHOLD';
      }

      setBmiResult({
        value: bmiValue.toString(),
        status,
        color,
        label
      });

      toast({ title: 'ANALYSIS_COMPLETE', description: `BMI calculated: ${bmiValue}` });
    } else {
      setBmiResult(null);
      toast({
        variant: 'destructive',
        title: 'DATA_INCOMPLETE',
        description: 'Inject valid biometric dimensions to initiate analysis.',
      });
    }
  };

  if (isAuthLoading || isProfileLoading || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4 animate-pulse">
        <Loader2 className="h-12 w-12 animate-spin text-primary glow-primary" />
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Retrieving_User_Node...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 fade-in pb-20">
      <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
          <UserIcon className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tighter font-headline glow-primary uppercase">USER_PROFILE</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">ID: {user.id.substring(0, 12)}...</p>
        </div>
      </div>

      <Card className="cyber-card bg-black/40 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Cpu size={100} />
        </div>
        <CardHeader>
          <CardTitle className="text-xl font-mono tracking-tighter text-primary uppercase flex items-center gap-2">
            <Activity size={18} />
            Biometric_Data
          </CardTitle>
          <CardDescription className="text-xs font-mono uppercase opacity-60">Manage your system identifiers and physical metrics.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Node_Alias</FormLabel>
                      <FormControl>
                        <Input placeholder="Operator_01" className="bg-black/60 border-primary/20 focus:border-primary/60 font-mono" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] font-mono text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Network_ID</FormLabel>
                      <FormControl>
                        <Input type="email" readOnly disabled className="bg-black/20 border-primary/10 font-mono opacity-50" {...field} />
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
                      <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Deployment_Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Level_11" className="bg-black/60 border-primary/20 focus:border-primary/60 font-mono" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="175"
                            className="bg-black/60 border-primary/20 focus:border-primary/60 font-mono"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
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
                        <FormLabel className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="70"
                            className="bg-black/60 border-primary/20 focus:border-primary/60 font-mono"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                              setBmiResult(null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {bmiResult && (
                <div className="flex items-center gap-4 p-5 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in shadow-[0_0_15px_rgba(0,242,255,0.05)]">
                  <div className={`h-10 w-10 rounded border flex items-center justify-center shrink-0 ${bmiResult.color} border-current/20`}>
                     <Zap size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Analysis_Output</span>
                    <p className="text-sm font-mono font-bold tracking-tight">
                      BMI_COEFFICIENT: <span className={bmiResult.color}>{bmiResult.value}</span>
                      <span className={`ml-4 text-[10px] uppercase px-2 py-0.5 rounded border border-current/30 ${bmiResult.color}`}>
                        {bmiResult.label}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-primary/10">
                <Button type="submit" disabled={isSubmitting} className="cyber-button bg-primary text-black font-mono font-bold px-10">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  SYNC_CHANGES
                </Button>
                
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 font-mono text-[10px] tracking-widest uppercase">
                      ROTATE_ACCESS_KEYS
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                    <DialogHeader>
                      <DialogTitle className="font-mono text-xl tracking-tighter text-primary glow-primary uppercase">SECURITY_PROTOCOL_INIT</DialogTitle>
                      <DialogDescription className="text-xs font-mono uppercase opacity-70">
                        Rotation of authentication keys requires double-blind verification.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 pt-4">
                        <FormField
                          control={passwordForm.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-mono uppercase tracking-widest opacity-60">Current_Access_Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-primary/20 font-mono" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px] font-mono text-destructive" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-mono uppercase tracking-widest opacity-60">New_Access_Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-primary/20 font-mono" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px] font-mono text-destructive" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-mono uppercase tracking-widest opacity-60">Verify_New_Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" className="bg-black/40 border-primary/20 font-mono" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px] font-mono text-destructive" />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="pt-4">
                          <Button type="submit" disabled={isPasswordSubmitting} className="cyber-button bg-primary text-black font-mono font-bold w-full">
                            {isPasswordSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            AUTHORIZE_ROTATION
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                 <Button type="button" variant="ghost" onClick={handleCalculateBmi} className="text-accent hover:text-accent hover:bg-accent/10 font-mono text-[10px] tracking-widest uppercase ml-auto">
                   <Zap size={14} className="mr-2" /> RUN_BMI_ANALYSIS
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
