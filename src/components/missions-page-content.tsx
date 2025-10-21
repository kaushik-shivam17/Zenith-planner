'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Rocket, Target } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
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
              Your ambitious, long-term missions. Click one to manage its goals.
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
        <CardContent>
          {missions.length === 0 ? (
             <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <Rocket className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Embark on a New Mission</h3>
                <p className="mt-1 text-sm">Add a new mission to start your next big adventure.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
            {missions.map((mission) => (
              <Card 
                key={mission.id} 
                className="group flex flex-col hover:bg-card/70 hover:border-primary/50 cursor-pointer transition-all"
                onClick={() => router.push(`/missions/${mission.id}`)}
              >
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="truncate pr-4">{mission.title}</span>
                        <span className="text-sm font-normal text-primary">
                            {Math.round(mission.progress)}%
                        </span>
                    </CardTitle>
                    <Progress value={mission.progress} className="h-2" />
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{mission.completedGoals} / {mission.totalGoals} goals completed</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                    </p>
                </CardFooter>
              </Card>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
