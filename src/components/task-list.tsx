'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BrainCircuit,
  CalendarCheck2,
  ClipboardList,
  Loader2,
  Split,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

import { generateScheduleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// The Task type from the props will have a JS Date object.
type Task = {
  id: string;
  title: string;
  description?: string;
  deadline: Date; // JS Date
  completed: boolean;
  subtasks?: string[];
};

type TaskListProps = {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
};

export function TaskList({ tasks, onUpdateTask, onToggleTask }: TaskListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null);

  const handleBreakdown = (task: Task) => {
    setIsBreakingDown(task.id);
    // Navigate to the new roadmap page
    router.push(`/roadmap/${task.id}`);
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setScheduleData(null);
    const taskString = tasks
      .filter((t) => !t.completed)
      .map(
        (t) =>
          `${t.title} (Deadline: ${t.deadline.toLocaleDateString()})`
      )
      .join('; ');

    if (!taskString) {
      toast({
        variant: 'destructive',
        title: 'No Active Tasks',
        description: 'Add some tasks before generating a schedule.',
      });
      setIsGenerating(false);
      return;
    }

    const result = await generateScheduleAction(taskString);
    if (result.success && result.data) {
      setScheduleData(result.data.schedule);
      setIsScheduleOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Schedule Generation Failed',
        description: result.error,
      });
    }
    setIsGenerating(false);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
        <ClipboardList className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No Tasks Here!</h3>
        <p className="mt-1 text-sm">Click "Add Task" to get started.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Generate AI Schedule
          </Button>
        </div>
        <ScrollArea className="h-[400px] pr-4 -mr-4">
          <div className="space-y-3">
            {tasks
              .map(task => ({
                ...task,
                deadline: task.deadline instanceof Date ? task.deadline : (task.deadline as unknown as Timestamp).toDate(),
              }))
              .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
              .map((task) => {
                const isOverdue = isPast(task.deadline) && !task.completed;
                return (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all group hover:border-primary/50 hover:bg-card/50 ${isOverdue ? 'border-destructive/50 bg-destructive/10' : 'bg-card'}`}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium cursor-pointer ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                        </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                         {isOverdue ? <AlertTriangle className="h-4 w-4" /> : <CalendarCheck2 className="h-4 w-4" />}
                        <span>
                          Due {formatDistanceToNow(task.deadline, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!task.completed && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBreakdown(task)}
                                disabled={!!isBreakingDown}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {isBreakingDown === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                <Split className="h-4 w-4" />
                                )}
                                <span className="sr-only">Create Roadmap</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Generate AI Roadmap</p>
                        </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )})}
          </div>
        </ScrollArea>

        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                <span>AI-Generated Study Schedule</span>
              </DialogTitle>
              <DialogDescription>
                Here is a suggested schedule based on your active tasks. You can adjust this in the Timetable page.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4">
              <div
                className="prose prose-sm prose-invert"
                dangerouslySetInnerHTML={{
                  __html: scheduleData
                    ? scheduleData.replace(/\n/g, '<br />')
                    : '',
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
