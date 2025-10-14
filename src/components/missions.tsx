'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { breakDownTaskAction } from '@/app/actions';

type Mission = {
  id: string;
  title: string;
  progress: number;
};

type Breakdown = {
  title: string;
  steps: string[];
};

export function Missions() {
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', title: 'Launch a startup', progress: 25 },
    { id: '2', title: 'Run a marathon', progress: 50 },
    { id: '3', title: 'Write a novel', progress: 10 },
  ]);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<Breakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddMission = () => {
    if (newMissionTitle.trim()) {
      setMissions([
        ...missions,
        {
          id: crypto.randomUUID(),
          title: newMissionTitle,
          progress: 0,
        },
      ]);
      setNewMissionTitle('');
      setIsAddOpen(false);
    }
  };

  const handleDeleteMission = (id: string) => {
    setMissions(missions.filter((mission) => mission.id !== id));
  };

  const handleBreakdown = async (mission: Mission) => {
    setIsLoading(true);
    setBreakdownData(null);
    const result = await breakDownTaskAction(mission.title);
    if (result.success && result.data) {
      setBreakdownData({ title: mission.title, steps: result.data.steps });
      setIsBreakdownOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Breakdown Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

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
                />
                <Button onClick={handleAddMission}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions.length === 0 ? (
             <div className="text-center text-muted-foreground py-12">
                <Rocket className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No missions yet</h3>
                <p className="mt-1 text-sm">Add a new mission to get started on your next big adventure.</p>
            </div>
          ) : (
            missions.map((mission) => (
            <div key={mission.id} className="group flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{mission.title}</span>
                <span className="text-xs text-muted-foreground">
                  {mission.progress}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${mission.progress}%` }}
                ></div>
              </div>
               <div className="flex justify-end gap-2 items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => handleBreakdown(mission)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Use AI
                  </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteMission(mission.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot />
              <span>Mission Breakdown: {breakdownData?.title}</span>
            </DialogTitle>
            <DialogDescription>
              The AI has broken down your mission into smaller steps.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 pt-4">
            {breakdownData?.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <Rocket className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
