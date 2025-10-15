'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Plus, Rocket, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { useMissions } from '@/hooks/use-missions';
import type { Mission } from '@/lib/types';
import { Slider } from './ui/slider';


export function Missions() {
  const router = useRouter();
  const { missions, addMission, deleteMission, updateMissionProgress, isLoading } = useMissions();
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const handleAddMission = () => {
    if (newMissionTitle.trim()) {
      addMission({ title: newMissionTitle });
      setNewMissionTitle('');
      setIsAddOpen(false);
    }
  };

  const handleBreakdown = (mission: Mission) => {
    // Navigate to the roadmap page for the specific mission
    router.push(`/roadmap/${mission.id}?type=mission`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rocket />
              <span>Missions</span>
            </CardTitle>
            <CardDescription>
              Your ambitious, long-term missions.
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" />
                Add Mission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Mission</DialogTitle>
                <DialogDescription>
                  What great endeavor will you embark on?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  placeholder="e.g., Learn to play the guitar"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMission()}
                />
                <Button onClick={handleAddMission}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          {missions.length === 0 ? (
             <div className="text-center text-muted-foreground py-12">
                <Rocket className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No missions yet</h3>
                <p className="mt-1 text-sm">Add a new mission to get started on your next big adventure.</p>
            </div>
          ) : (
            missions.map((mission) => (
            <div key={mission.id} className="group flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{mission.title}</span>
                <span className="text-sm text-muted-foreground">
                  {mission.progress}%
                </span>
              </div>
              <Slider 
                defaultValue={[mission.progress]} 
                max={100} 
                step={1}
                onValueCommit={(value) => updateMissionProgress(mission.id, value[0])}
              />
               <div className="flex justify-end gap-2 items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => handleBreakdown(mission)}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    AI Roadmap
                  </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMission(mission.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
