'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Bot, Loader2, Send, ShieldAlert, Cpu, Terminal } from 'lucide-react';
import { generateTaskRoadmap, type RoadmapOutput } from '@/lib/ai';
import { blink } from '@/blink/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/use-tasks';
import { useMissions } from '@/hooks/use-missions';

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export function RoadmapContent({ taskId }: { taskId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const itemType = searchParams.get('type') === 'mission' ? 'mission' : 'task';

  const { getTaskById, updateTask, isLoading: areTasksLoading } = useTasks();
  const { getMissionById, updateMission, isLoading: areMissionsLoading } = useMissions();

  const [roadmap, setRoadmap] = useState<RoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const item = useMemo(() => {
    if (itemType === 'mission') {
      return getMissionById(taskId);
    }
    return getTaskById(taskId);
  }, [taskId, itemType, getMissionById, getTaskById]);
  
  const isItemLoading = areTasksLoading || areMissionsLoading;

  useEffect(() => {
    if (isItemLoading) return;
    
    if (item) {
      if (item.roadmap) {
        setRoadmap(item.roadmap as RoadmapOutput);
        setChatHistory([{ role: 'model', content: (item.roadmap as RoadmapOutput).introduction }]);
        setIsLoading(false);
      } else {
        const fetchRoadmap = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const newRoadmap = await generateTaskRoadmap(item.title);
            setRoadmap(newRoadmap);
            setChatHistory([{ role: 'model', content: newRoadmap.introduction }]);
            
            if (itemType === 'task') {
              await updateTask(item.id, { roadmap: newRoadmap });
            } else {
              await updateMission(item.id, { roadmap: newRoadmap });
            }
          } catch (err: any) {
            setError(err.message || 'FAILED_TO_DECODE_ROADMAP');
            toast({
              variant: 'destructive',
              title: 'SYSTEM_ERROR',
              description: 'Could not initialize mission roadmap.',
            });
          }
          setIsLoading(false);
        };
        fetchRoadmap();
      }
    } else if (!isItemLoading) {
      setError(`NODE_NOT_FOUND: ${taskId}`);
      setIsLoading(false);
    }
  }, [item, isItemLoading, taskId, itemType, toast, updateTask, updateMission]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !item) return;
  
    const userMsg = userInput;
    setUserInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const { textStream } = await blink.ai.streamText({
        model: 'google/gemini-2.0-flash',
        prompt: `You are the Zenith AI Architect. A user is asking about their ${itemType}: "${item.title}".
        Context: They are following this roadmap: ${JSON.stringify(roadmap)}.
        User query: ${userMsg}
        Provide a sharp, helpful, and cyber-themed response. Keep it concise.`,
      });

      let fullText = '';
      setChatHistory((prev) => [...prev, { role: 'model', content: '' }]);

      for await (const delta of textStream) {
        fullText += delta;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = fullText;
          return newHistory;
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'COMM_FAILURE',
        description: 'Failed to receive AI transmission.',
      });
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const backUrl = itemType === 'mission' ? '/missions' : '/tasks';
  const backLabel = itemType === 'mission' ? 'EXIT_CAMPAIGNS' : 'EXIT_LOGS';

  if (isLoading || isItemLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center animate-pulse">
        <Cpu className="h-16 w-16 text-primary mb-6 animate-spin glow-primary" />
        <h2 className="text-2xl font-mono tracking-tighter glow-primary">DECODING_MISSION_PATH...</h2>
        <p className="text-muted-foreground font-mono text-xs mt-2 uppercase">Synthesizing high-performance protocols.</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center border border-destructive/20 rounded-xl bg-destructive/5 p-8">
         <ShieldAlert className="h-20 w-20 text-destructive mb-6 glow-accent" />
        <h2 className="text-2xl font-mono tracking-tighter text-destructive uppercase">
          {error || 'NODE_ERROR'}
        </h2>
        <p className="text-muted-foreground font-mono text-xs mt-4 max-w-md uppercase tracking-widest">
          The requested data node has been corrupted or disconnected from the core.
        </p>
        <Button onClick={() => router.push(backUrl)} variant="destructive" className="mt-8 cyber-button px-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in pb-12">
      <div className="lg:col-span-2 space-y-8">
        <Button variant="ghost" onClick={() => router.push(backUrl)} className="text-primary hover:text-primary/80 font-mono text-xs tracking-widest p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-primary glow-primary" />
            <span className="text-[10px] font-mono tracking-widest text-primary uppercase">Protocol Overview</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter font-headline glow-primary uppercase break-words">
            {item.title}
          </h1>
        </div>

        {roadmap && (
          <Accordion type="multiple" defaultValue={roadmap.milestones.map(m => m.title)} className="w-full space-y-4">
            {roadmap.milestones.map((milestone, mIdx) => (
              <AccordionItem 
                value={milestone.title} 
                key={milestone.title} 
                className="cyber-card border-primary/20 bg-black/40 px-6 py-2"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">{milestone.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-primary/60 tracking-widest uppercase">Phase_0{mIdx + 1}</span>
                      <span className="text-lg font-mono font-bold tracking-tight text-foreground glow-primary uppercase">{milestone.title}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="h-px w-full bg-gradient-to-r from-primary/30 to-transparent mb-6" />
                  <ul className="space-y-4 pl-4">
                    {milestone.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-4 group">
                        <Checkbox 
                          id={`${milestone.title}-step-${index}`} 
                          className="mt-1 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black" 
                        />
                        <label 
                          htmlFor={`${milestone.title}-step-${index}`} 
                          className="text-sm font-mono text-muted-foreground group-hover:text-primary transition-colors cursor-pointer leading-relaxed uppercase tracking-tight"
                        >
                          {step}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {roadmap && (
          <Card className="bg-primary/5 border border-primary/20 p-6 rounded-xl border-dashed">
            <p className="text-center text-sm font-mono tracking-wider text-primary glow-primary italic uppercase leading-relaxed">
              "{roadmap.conclusion}"
            </p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-1 h-fit sticky top-8">
        <Card className="cyber-card border-primary/30 bg-black/60 flex flex-col h-[650px] shadow-2xl">
          <CardHeader className="border-b border-primary/10 py-4 bg-primary/5">
            <CardTitle className="flex items-center gap-3 text-sm font-mono tracking-tighter glow-primary text-primary uppercase">
              <Terminal size={18} />
              Architect_Mentor_v2
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" ref={chatContainerRef}>
              <div className="space-y-6 pt-2">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded border shrink-0 ${
                      msg.role === 'user' ? 'bg-accent/10 border-accent/30' : 'bg-primary/10 border-primary/30'
                    }`}>
                      {msg.role === 'model' ? <Bot size={16} className="text-primary" /> : <ShieldAlert size={16} className="text-accent" />}
                    </div>
                    <div className={`rounded-lg p-3 max-w-[85%] border shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-accent/10 border-accent/20 text-accent-foreground rounded-tr-none'
                          : 'bg-primary/5 border-primary/20 text-foreground rounded-tl-none'
                      }`}
                    >
                      <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex items-start gap-3">
                     <div className="flex h-8 w-8 items-center justify-center rounded border bg-primary/10 border-primary/30 shrink-0">
                        <Loader2 size={16} className="text-primary animate-spin" />
                     </div>
                     <div className="rounded-lg p-3 bg-primary/5 border border-primary/20 animate-pulse">
                        <div className="h-2 w-12 bg-primary/20 rounded" />
                     </div>
                   </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 pt-4 border-t border-primary/10">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="TERMINAL_PROMPT..."
                className="bg-black/60 border-primary/20 focus:border-primary/60 font-mono text-xs h-10"
                disabled={isChatLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isChatLoading || !userInput.trim()}
                className="cyber-button bg-primary hover:bg-primary/90 text-black h-10 w-10 p-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
