
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMissions } from '@/hooks/use-missions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoals } from '@/hooks/use-goals';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { suggestGoalsForMissionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type GoalFormData = {
  title: string;
  description: string;
}

export default function MissionDetailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { missionId } = useParams();
  const { getMissionById, isLoading: isMissionsLoading, deleteMission } = useMissions();
  const { goals, addGoal, toggleGoalCompletion, deleteGoal, isLoading: areGoalsLoading } = useGoals(missionId as string);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<GoalFormData>({ title: '', description: '' });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedGoals, setSuggestedGoals] = useState<string[]>([]);
  
  const mission = getMissionById(missionId as string);
  const isLoading = isMissionsLoading || areGoalsLoading;

  const handleAddGoal = async () => {
    if (newGoal.title.trim()) {
      await addGoal(newGoal);
      setNewGoal({ title: '', description: '' });
      setIsAddGoalOpen(false);
    }
  };

  const handleSuggestGoals = async () => {
    if (!mission) return;
    setIsAiLoading(true);
    setSuggestedGoals([]);
    const result = await suggestGoalsForMissionAction(mission.title);
    if (result.success) {
      setSuggestedGoals(result.data.goals);
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: result.error,
      });
    }
    setIsAiLoading(false);
  };
  
  const handleAddSuggestedGoal = async (title: string) => {
    await addGoal({ title, description: '' });
    setSuggestedGoals(prev => prev.filter(g => g !== title));
  };
  
  const handleDeleteMission = async () => {
    if (mission) {
      const confirmed = confirm('Are you sure you want to delete this mission and all its goals? This action cannot be undone.');
      if (confirmed) {
        await deleteMission(mission.id);
        toast({ title: 'Mission Deleted' });
        router.push('/missions');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Mission not found</h2>
        <Button onClick={() => router.push('/missions')} className="mt-4">
          Back to Missions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/missions')}>
          <ArrowLeft className="mr-2" />
          Back to Missions
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeleteMission}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Mission
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{mission.title}</CardTitle>
          <CardDescription>Manage the goals for your mission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Goal</DialogTitle>
                  <DialogDescription>
                    What's the next step for your mission?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                    placeholder="Goal title"
                  />
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                    placeholder="Goal description (optional)"
                    className="resize-none"
                  />
                  <Button onClick={handleAddGoal} disabled={!newGoal.title.trim()} className="w-full">
                    Save Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="w-full" onClick={handleSuggestGoals} disabled={isAiLoading}>
              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggest with AI
            </Button>
          </div>

          {suggestedGoals.length > 0 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Goal Suggestions</AlertTitle>
              <AlertDescription>
                Click to add any of these suggested goals to your mission.
                 <ul className="mt-2 space-y-2">
                    {suggestedGoals.map((goal, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{goal}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleAddSuggestedGoal(goal)}>
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </li>
                    ))}
                  </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 pt-4">
            <h3 className="text-lg font-medium">Current Goals</h3>
             {goals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No goals yet. Add one manually or use the AI to suggest some!</p>
            ) : (
              goals.map(goal => (
                <div key={goal.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-secondary/50 group border">
                   <Checkbox 
                    id={`goal-${goal.id}`}
                    checked={goal.completed}
                    onCheckedChange={() => toggleGoalCompletion(goal.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`goal-${goal.id}`} 
                      className={`font-medium text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {goal.title}
                    </label>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
