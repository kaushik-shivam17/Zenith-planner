'use client';

import { useState } from 'react';
import {
  Bot,
  BrainCircuit,
  CalendarCheck2,
  Check,
  ClipboardList,
  Loader2,
  Splitscreen,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import type { Task } from '@/lib/types';
import { breakDownTaskAction, generateScheduleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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

type TaskListProps = {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
  onToggleTask: (taskId: string) => void;
};

export function TaskList({ tasks, onUpdateTask, onToggleTask }: TaskListProps) {
  const { toast } = useToast();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<{
    title: string;
    steps: string[];
  } | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBreakdown = async (task: Task) => {
    setIsBreakingDown(true);
    setBreakdownData(null);
    const result = await breakDownTaskAction(task.title);
    if (result.success && result.data) {
      setBreakdownData({ title: task.title, steps: result.data.steps });
      setIsBreakdownOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Breakdown Failed',
        description: result.error,
      });
    }
    setIsBreakingDown(false);
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setScheduleData(null);
    const taskString = tasks
      .filter((t) => !t.completed)
      .map(
        (t) =>
          `${t.title} (Deadline: ${format(
            t.deadline,
            'PPP'
          )}, Details: ${t.details || 'N/A'})`
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
      <div className="text-center text-muted-foreground py-12">
        <ClipboardList className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No tasks logged</h3>
        <p className="mt-1 text-sm">Add a new task to get started.</p>
      </div>
    );
  }

  return (
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
          Generate Study Schedule
        </Button>
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {tasks
            .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
            .map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 rounded-md border transition-all"
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
                    className={`font-medium ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {task.details}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarCheck2 className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(task.deadline, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {!task.completed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBreakdown(task)}
                    disabled={isBreakingDown}
                  >
                    <Splitscreen className="h-4 w-4" />
                    <span className="sr-only">Break down task</span>
                  </Button>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>
      <Dialog open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot />
              <span>Task Breakdown: {breakdownData?.title}</span>
            </DialogTitle>
            <DialogDescription>
              The AI has broken down your task into smaller steps.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 pt-4">
            {breakdownData?.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot />
              <span>AI-Generated Study Schedule</span>
            </DialogTitle>
            <DialogDescription>
              Here is a suggested schedule based on your active tasks.
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
  );
}
