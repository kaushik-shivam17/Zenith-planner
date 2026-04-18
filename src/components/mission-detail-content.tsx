'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Sparkles, Trash2, Rocket, Target, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { suggestMissionGoals } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useGoals } from '@/hooks/use-goals';
import { useMissions } from '@/hooks/use-missions';

type GoalFormData = {
  title: string;
  description: string;
}

export function MissionDetailContent({ missionId }: { missionId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { getMissionById, isLoading: isMissionsLoading, deleteMission } = useMissions();
  const { goals, addGoal, toggleGoalCompletion, deleteGoal, isLoading: areGoalsLoading } = useGoals(missionId);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<GoalFormData>({ title: '', description: '' });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedGoals, setSuggestedGoals] = useState<string[]>([]);
  
  const mission = getMissionById(missionId);
  const isLoading = isMissionsLoading || areGoalsLoading;

  const handleAddGoal = async () => {
    if (newGoal.title.trim()) {
      await addGoal(newGoal);
      setNewGoal({ title: '', description: '' });
      setIsAddGoalOpen(false);
      toast({ title: 'GOAL_ACQUIRED', description: 'Objective has been logged.' });
    }
  };

  const handleSuggestGoals = async () => {
    if (!mission) return;
    setIsAiLoading(true);
    setSuggestedGoals([]);
    try {
      const result = await suggestMissionGoals(mission.title);
      setSuggestedGoals(result);
      toast({ title: 'AI_STRATEGY_DECODED', description: 'Tactical objectives generated.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'STRATEGY_FAILURE',
        description: error.message || 'Mission control failed to respond.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleAddSuggestedGoal = async (title: string) => {
    await addGoal({ title, description: '' });
    setSuggestedGoals(prev => prev.filter(g => g !== title));
  };
  
  const handleDeleteMission = async () => {
    if (mission) {
      if (confirm('TERMINATE MISSION? ALL DATA NODES WILL BE PURGED.')) {
        await deleteMission(mission.id);
        router.push('/missions');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 animate-pulse">
        <Loader2 className="h-12 w-12 animate-spin text-primary glow-primary" />
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Syncing_Mission_Data...</span>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8 border border-destructive/20 bg-destructive/5 rounded-2xl">
        <Rocket className="h-16 w-16 text-destructive mb-6 glow-accent rotate-180" />
        <h2 className="text-2xl font-mono tracking-tighter text-destructive uppercase">Mission_Not_Found</h2>
        <p className="text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest">Protocol error: Node disconnect.</p>
        <Button onClick={() => router.push('/missions')} variant="outline" className="mt-8 border-destructive/20 text-destructive hover:bg-destructive/10 font-mono text-xs">
          RETURN_TO_BASE
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 fade-in">
      <div className="flex items-center justify-between border-b border-primary/10 pb-6">
        <Button variant="ghost" onClick={() => router.push('/missions')} className="text-primary hover:text-primary hover:bg-primary/5 font-mono text-xs tracking-widest uppercase p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back_To_Campaigns
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDeleteMission} className="text-destructive hover:text-destructive hover:bg-destructive/10 font-mono text-[10px] tracking-widest uppercase">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Terminate_Mission
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-10 bg-primary glow-primary" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">Active_Operation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline glow-primary uppercase break-words">
          {mission.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="cyber-card bg-black/40 border-primary/20">
            <CardHeader className="border-b border-primary/10 pb-6 bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm tracking-widest text-primary flex items-center gap-2 uppercase">
                   <Target size={16} />
                   Tactical_Objectives
                </CardTitle>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-mono text-primary/60">{Math.round(mission.progress)}%</span>
                   <div className="w-24 h-1 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary glow-primary" style={{ width: `${mission.progress}%` }} />
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                  <DialogTrigger asChild>
                    <Button className="cyber-button bg-primary text-black font-mono font-bold text-xs h-12 flex-1">
                      <Plus className="mr-2 h-4 w-4" /> MANUAL_INJECT
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                    <DialogHeader>
                      <DialogTitle className="font-mono text-xl tracking-tighter text-primary glow-primary uppercase">NEW_GOAL_PROTOCOL</DialogTitle>
                      <DialogDescription className="text-xs font-mono uppercase opacity-70">
                        Define next tactical milestone for this operation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-primary/60">Objective_Title</label>
                        <Input
                          value={newGoal.title}
                          onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                          placeholder="e.g., SYSTEM_OVERRIDE"
                          className="bg-black/40 border-primary/20 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-primary/60">Data_Supplementary</label>
                        <Textarea
                          value={newGoal.description}
                          onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                          placeholder="Inject objective parameters..."
                          className="bg-black/40 border-primary/20 font-mono h-24 resize-none"
                        />
                      </div>
                      <Button onClick={handleAddGoal} disabled={!newGoal.title.trim()} className="w-full cyber-button bg-primary text-black font-mono font-bold">
                        AUTHORIZE_INJECTION
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="border-accent/20 text-accent hover:bg-accent/5 font-mono font-bold text-xs h-12 flex-1" onClick={handleSuggestGoals} disabled={isAiLoading}>
                  {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI_STRATEGY_GEN
                </Button>
              </div>

              {suggestedGoals.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 space-y-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                     <Cpu size={30} className="text-accent" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent glow-accent" />
                    <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-widest">AI_SUGGESTED_PROTOCOLS</h4>
                  </div>
                   <ul className="space-y-3">
                      {suggestedGoals.map((goal, index) => (
                        <li key={index} className="flex items-center justify-between p-2 rounded border border-accent/10 bg-accent/5 hover:border-accent/30 transition-all group">
                          <span className="text-xs font-mono text-accent/80 uppercase">{goal}</span>
                          <Button size="sm" variant="ghost" className="h-8 text-accent hover:text-accent hover:bg-accent/10 px-2" onClick={() => handleAddSuggestedGoal(goal)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> <span className="text-[9px] font-mono font-bold">DEPLOY</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-mono font-bold tracking-widest text-primary/40 uppercase">ACTIVE_LOGS</h3>
                   <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-40">TOTAL: {goals.length}</span>
                </div>
                
                 {goals.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-primary/10 rounded-xl bg-primary/5">
                    <Target className="mx-auto h-12 w-12 text-primary/20 mb-4" />
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">Mainframe empty. Inject objectives to begin sequence.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map(goal => (
                      <div key={goal.id} className="flex items-start gap-4 p-4 rounded-xl cyber-card group border-primary/10 hover:bg-primary/5 transition-all">
                         <Checkbox 
                          id={`goal-${goal.id}`}
                          checked={goal.completed}
                          onCheckedChange={() => toggleGoalCompletion(goal.id)}
                          className="mt-1 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                        />
                        <div className="flex-1 space-y-1">
                          <label 
                            htmlFor={`goal-${goal.id}`} 
                            className={`text-sm font-mono tracking-tight uppercase cursor-pointer transition-all ${goal.completed ? 'line-through text-muted-foreground opacity-50' : 'text-foreground group-hover:text-primary'}`}
                          >
                            {goal.title}
                          </label>
                          {goal.description && (
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter opacity-60 leading-relaxed">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 rounded"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <Card className="cyber-card bg-black/40 border-primary/20">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                 <CardTitle className="font-mono text-xs tracking-widest text-primary uppercase flex items-center gap-2">
                    <Activity size={14} /> Mission_Biometrics
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                       <span>completion_status</span>
                       <span className="text-primary">{Math.round(mission.progress)}%</span>
                    </div>
                    <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary glow-primary animate-pulse" style={{ width: `${mission.progress}%` }} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded border border-primary/10 bg-primary/5">
                       <div className="text-[9px] font-mono text-primary/60 uppercase mb-1">TOTAL_LOGS</div>
                       <div className="text-xl font-mono font-bold text-primary tracking-tighter">{mission.totalGoals}</div>
                    </div>
                    <div className="p-3 rounded border border-primary/10 bg-primary/5">
                       <div className="text-[9px] font-mono text-primary/60 uppercase mb-1">RESOLVED</div>
                       <div className="text-xl font-mono font-bold text-primary tracking-tighter">{mission.completedGoals}</div>
                    </div>
                 </div>

                 <div className="pt-4 flex justify-center">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                       <svg className="absolute inset-0 h-full w-full -rotate-90">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/10" />
                          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - mission.progress / 100)}`} strokeLinecap="round" className="text-primary glow-primary transition-all duration-1000" />
                       </svg>
                       <ShieldCheck className="text-primary h-8 w-8 glow-primary" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-xl border border-dashed border-primary/20 bg-primary/5">
              <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-3">Operator_Directive</h4>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed uppercase opacity-70">
                Focus on high-impact objectives to accelerate mission progress. Maintain synchronization with AI strategy for optimal resource allocation.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
