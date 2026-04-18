'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Rocket, Target, Activity, Cpu, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/data-provider';

export function MissionsPageContent() {
  const router = useRouter();
  const { missions, addMission, isLoading } = useData();
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const handleAddMission = async () => {
    if (newMissionTitle.trim()) {
      await addMission({ title: newMissionTitle });
      setNewMissionTitle('');
      setIsAddOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-primary glow-primary" />
        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Loading_Campaigns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded border border-primary/30 bg-primary/10 flex items-center justify-center glow-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]">
            <Rocket size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter font-headline glow-primary uppercase">MISSION_CONTROL</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mt-1 animate-pulse">DEPLOYMENT_CENTER_v4.2</p>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="cyber-button bg-primary text-black font-mono font-bold text-xs h-12 w-full md:w-auto px-8">
              <Plus className="mr-2 h-4 w-4" />
              INITIATE_NEW_CAMPAIGN
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-mono tracking-tighter glow-primary text-primary uppercase flex items-center gap-2">
                 <Cpu size={24} /> MISSION_INIT
              </DialogTitle>
              <DialogDescription className="text-xs font-mono uppercase opacity-70">
                Define the primary objective for your next operational campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 pt-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-mono uppercase text-primary/60 tracking-widest">Campaign_Identifier</label>
                 <Input
                    value={newMissionTitle}
                    onChange={(e) => setNewMissionTitle(e.target.value)}
                    placeholder="e.g., NEURAL_SYNC_PROJECT"
                    className="bg-black/40 border-primary/20 font-mono text-sm h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMission()}
                  />
              </div>
              <Button onClick={handleAddMission} className="cyber-button bg-primary text-black font-mono font-bold h-12">DEPLOY_PROTOCOL</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-primary/40 px-2">
           <Activity size={14} />
           <span className="text-[9px] font-mono tracking-widest uppercase">Active_Campaign_Nodes: {missions.length}</span>
        </div>

        {missions.length === 0 ? (
           <div className="text-center py-32 border border-dashed border-primary/20 rounded-2xl bg-black/20 cyber-card group">
              <Rocket className="mx-auto h-20 w-20 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
              <h3 className="text-2xl font-mono tracking-tighter text-primary/60 uppercase">NO_ACTIVE_MISSIONS</h3>
              <p className="mt-2 text-xs font-mono uppercase tracking-[0.2em] opacity-40">Initialize your first campaign node to begin sequence.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
          {missions.map((mission) => (
            <Card 
              key={mission.id} 
              className="group relative flex flex-col bg-black/40 border-primary/20 hover:border-primary/50 cursor-pointer transition-all duration-300 overflow-hidden cyber-card"
              onClick={() => router.push(`/missions/${mission.id}`)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck size={80} />
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-primary glow-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Operation_Node</span>
                      <span className="text-xs font-mono font-bold text-primary glow-primary">
                          {Math.round(mission.progress)}%_SYNC
                      </span>
                  </div>
                  <CardTitle className="text-xl font-mono font-bold tracking-tight text-foreground group-hover:text-primary transition-colors uppercase truncate">
                    {mission.title}
                  </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                  <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/5">
                    <div 
                      className="h-full bg-primary glow-primary transition-all duration-1000 ease-out group-hover:animate-pulse" 
                      style={{ width: `${mission.progress}%` }} 
                    />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-3 uppercase tracking-tighter">
                      <Target className="h-3 w-3 text-primary" />
                      <span>{mission.completedGoals} / {mission.totalGoals} objectives_resolved</span>
                  </div>
              </CardContent>
              
              <CardFooter className="pt-4 border-t border-primary/10 bg-primary/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">Status: {mission.progress === 100 ? 'SUCCESS' : 'IN_PROGRESS'}</span>
                  <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                     <span className="text-[9px] font-mono font-bold uppercase">ENTER_NODE</span>
                     <ChevronRight size={12} />
                  </div>
              </CardFooter>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
