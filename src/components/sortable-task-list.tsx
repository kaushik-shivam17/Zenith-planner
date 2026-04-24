'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BrainCircuit,
  CalendarCheck2,
  ClipboardList,
  Loader2,
  Split,
  Zap,
  ShieldAlert,
  Cpu,
  GripVertical,
  ListOrdered,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

import { generateStudySchedule } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
  subtasks?: string[];
};

type TaskListProps = {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
};

type SortMode = 'deadline' | 'manual';

const orderKey = (uid: string | null | undefined) => `zenith:task-order:${uid ?? 'anon'}`;
const modeKey = (uid: string | null | undefined) => `zenith:task-sort-mode:${uid ?? 'anon'}`;

export function SortableTaskList({ tasks, onUpdateTask, onToggleTask }: TaskListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('deadline');
  const [orderMap, setOrderMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const m = localStorage.getItem(modeKey(user?.id));
      if (m === 'manual' || m === 'deadline') setSortMode(m);
      const o = localStorage.getItem(orderKey(user?.id));
      if (o) setOrderMap(JSON.parse(o));
    } catch {}
  }, [user?.id]);

  const sortedTasks = useMemo(() => {
    if (sortMode === 'manual') {
      const ordered = [...tasks].sort((a, b) => {
        const ai = orderMap[a.id] ?? Number.MAX_SAFE_INTEGER;
        const bi = orderMap[b.id] ?? Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        return a.deadline.getTime() - b.deadline.getTime();
      });
      return ordered;
    }
    return [...tasks].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [tasks, sortMode, orderMap]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistOrder = (next: Record<string, number>) => {
    setOrderMap(next);
    try {
      localStorage.setItem(orderKey(user?.id), JSON.stringify(next));
    } catch {}
  };

  const setMode = (m: SortMode) => {
    setSortMode(m);
    try {
      localStorage.setItem(modeKey(user?.id), m);
    } catch {}
    if (m === 'manual' && Object.keys(orderMap).length === 0) {
      const seeded: Record<string, number> = {};
      sortedTasks.forEach((t, i) => (seeded[t.id] = i));
      persistOrder(seeded);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    if (sortMode !== 'manual') setMode('manual');
    const ids = sortedTasks.map((t) => t.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const reordered = arrayMove(ids, from, to);
    const next: Record<string, number> = {};
    reordered.forEach((id, i) => (next[id] = i));
    persistOrder(next);
  };

  const handleBreakdown = (task: Task) => {
    setIsBreakingDown(task.id);
    router.push(`/roadmap/${task.id}`);
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setScheduleData(null);
    const taskString = tasks
      .filter((t) => !t.completed)
      .map((t) => `${t.title} (BY: ${t.deadline.toLocaleDateString()})`)
      .join('; ');

    if (!taskString) {
      toast({
        variant: 'destructive',
        title: 'NO_ACTIVE_NODES',
        description: 'Initialize mission parameters before sync.',
      });
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateStudySchedule(taskString);
      setScheduleData(result);
      setIsScheduleOpen(true);
      toast({ title: 'STRATEGY_GENERATED', description: 'AI has calculated optimal mission path.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'SYNC_ERROR',
        description: error.message || 'Failed to calculate schedule.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 border border-dashed border-primary/20 rounded-2xl bg-black/20 cyber-card">
        <ClipboardList className="mx-auto h-16 w-16 opacity-20 mb-6" />
        <h3 className="text-xl font-mono tracking-tighter glow-primary text-primary/60 uppercase">
          No_Active_Tasks
        </h3>
        <p className="mt-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
          Mainframe is clear. Standby for new input.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-2">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-primary glow-primary" />
            <span className="text-[10px] font-mono text-primary tracking-widest uppercase">
              Node_Count: {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-primary/20 bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setMode('deadline')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors ${
                  sortMode === 'deadline'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-primary/80'
                }`}
                aria-pressed={sortMode === 'deadline'}
              >
                <CalendarIcon size={10} />
                AUTO
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors ${
                  sortMode === 'manual'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-primary/80'
                }`}
                aria-pressed={sortMode === 'manual'}
              >
                <ListOrdered size={10} />
                MANUAL
              </button>
            </div>
            <Button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              size="sm"
              className="cyber-button bg-primary text-black font-mono text-xs hover:bg-primary/80"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-3 w-3" />
              )}
              OPTIMIZE_FLOW
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4 pt-2">
                {sortedTasks.map((task) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    draggable={sortMode === 'manual'}
                    isBreakingDown={isBreakingDown === task.id}
                    disableBreakdown={!!isBreakingDown}
                    onToggle={() => onToggleTask(task.id)}
                    onBreakdown={() => handleBreakdown(task)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>

        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogContent className="max-w-2xl bg-card border-primary/30 cyber-card shadow-[0_0_50px_rgba(0,242,255,0.1)] p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
              <DialogTitle className="flex items-center gap-3 font-mono text-2xl tracking-tighter glow-primary text-primary uppercase">
                <BrainCircuit className="glow-primary" />
                <span>AI_STRATEGY_DECODER</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-mono uppercase tracking-widest opacity-60">
                Calculated optimal execution path for active missions.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-8">
              {scheduleData && (
                <div className="space-y-8 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduleData.sessions.map((session: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 relative group hover:border-primary/40 transition-all"
                      >
                        <div className="absolute top-2 right-2 text-[10px] font-mono text-primary/40 uppercase">
                          #{i + 1}
                        </div>
                        <h4 className="text-sm font-mono font-bold text-primary glow-primary uppercase tracking-tight">
                          {session.subject}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                          <Zap size={10} className="text-accent" />
                          <span>{session.duration} focus</span>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground leading-relaxed italic opacity-80">
                          {session.focus}
                        </p>
                        <div className="text-[9px] font-mono text-accent uppercase tracking-widest pt-2">
                          Break: {session.break}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold text-accent glow-accent uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} /> Tactical_Bio_Hacks
                    </h4>
                    <ul className="space-y-2">
                      {scheduleData.tips.map((tip: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-tight leading-relaxed"
                        >
                          <div className="h-1 w-1 rounded-full bg-accent mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="p-4 bg-black/40 border-t border-primary/10 flex justify-end">
              <Button
                onClick={() => setIsScheduleOpen(false)}
                className="cyber-button bg-primary text-black font-mono text-[10px] px-6"
              >
                TERMINATE_VIEW
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function SortableTaskRow({
  task,
  draggable,
  isBreakingDown,
  disableBreakdown,
  onToggle,
  onBreakdown,
}: {
  task: Task;
  draggable: boolean;
  isBreakingDown: boolean;
  disableBreakdown: boolean;
  onToggle: () => void;
  onBreakdown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto' as any,
  };
  const isOverdue = isPast(task.deadline) && !task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-5 rounded-xl border transition-colors duration-200 ${
        isOverdue
          ? 'border-destructive/40 bg-destructive/5 hover:border-destructive/60'
          : 'cyber-card hover:bg-primary/5'
      } ${isDragging ? 'shadow-[0_0_30px_hsl(var(--primary)/0.3)] border-primary/60 bg-primary/10' : ''}`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-3">
        {draggable && (
          <button
            type="button"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-primary/40 hover:text-primary transition-colors touch-none"
          >
            <GripVertical size={16} />
          </button>
        )}
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={onToggle}
          className={`mt-1.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black transition-all ${
            isOverdue ? 'border-destructive/40 data-[state=checked]:bg-destructive' : ''
          }`}
        />
        <div className="flex-1 space-y-1 min-w-0">
          <label
            htmlFor={`task-${task.id}`}
            className={`text-sm font-mono tracking-tight cursor-pointer transition-all break-words ${
              task.completed
                ? 'line-through text-muted-foreground opacity-50'
                : 'text-foreground group-hover:text-primary glow-primary'
            } ${isOverdue ? 'text-destructive group-hover:text-destructive' : ''}`}
          >
            {task.title.toUpperCase()}
          </label>
          {task.description && (
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter line-clamp-2 opacity-60">
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono tracking-widest uppercase transition-colors ${
                isOverdue
                  ? 'border-destructive/30 bg-destructive/10 text-destructive animate-pulse'
                  : 'border-primary/10 bg-primary/5 text-primary/70'
              }`}
            >
              {isOverdue ? <ShieldAlert size={10} /> : <CalendarCheck2 size={10} />}
              <span>{formatDistanceToNow(task.deadline, { addSuffix: true }).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {!task.completed && (
          <div className="flex items-center self-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBreakdown}
                  disabled={disableBreakdown}
                  className="h-8 w-8 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 hover:border-primary/40 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-[0_0_10px_rgba(0,242,255,0.1)]"
                >
                  {isBreakingDown ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Split className="h-4 w-4" />
                  )}
                  <span className="sr-only">DEPLOY_ROADMAP</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black border-primary/20 font-mono text-[10px] text-primary">
                <p>DEPLOY_ROADMAP_PROTOCOL</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
