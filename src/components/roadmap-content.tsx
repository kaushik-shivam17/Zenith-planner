'use client';

import { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Bot, Loader2, Send, Split } from 'lucide-react';
import {
  generateTaskRoadmapAction,
  continueConversationAction,
} from '@/app/actions';
import type { GenerateTaskRoadmapOutput } from '@/ai/flows/generate-task-roadmap';
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
import { DataContext } from '@/context/data-provider';

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export function RoadmapContent({ taskId }: { taskId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const itemType = searchParams.get('type') === 'mission' ? 'mission' : 'task';

  const { getTaskById, updateTask, isLoading: areTasksLoading } = useContext(DataContext);
  const { getMissionById, updateMission, isLoading: areMissionsLoading } = useContext(DataContext);

  const [roadmap, setRoadmap] = useState<GenerateTaskRoadmapOutput | null>(null);
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
    if (isItemLoading) {
      return;
    }
    if (item) {
      if (item.roadmap) {
        setRoadmap(item.roadmap);
        setChatHistory([{ role: 'model', content: item.roadmap.introduction }]);
        setIsLoading(false);
      } else {
        const fetchRoadmap = async () => {
          setIsLoading(true);
          setError(null);
          const result = await generateTaskRoadmapAction(item.title);
          if (result.success) {
            const newRoadmap = result.data;
            setRoadmap(newRoadmap);
            setChatHistory([{ role: 'model', content: newRoadmap.introduction }]);
            try {
                if (itemType === 'task') {
                    await updateTask(item.id, { roadmap: newRoadmap });
                } else {
                    await updateMission(item.id, { roadmap: newRoadmap });
                }
            } catch (e) {
                 toast({
                    variant: 'destructive',
                    title: 'Error Saving Roadmap',
                    description: 'Could not save the generated roadmap. Please try again.',
                });
            }
          } else {
            setError(result.error);
            toast({
              variant: 'destructive',
              title: 'Error Generating Roadmap',
              description: result.error,
            });
          }
          setIsLoading(false);
        };
        fetchRoadmap();
      }
    } else if (!isItemLoading) {
      setError(`The requested ${itemType} could not be found.`);
      setIsLoading(false);
    }
  }, [item, isItemLoading, toast, itemType, updateTask, updateMission]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !item) return;
  
    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    const newChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(newChatHistory);
    setUserInput('');
    setIsChatLoading(true);
  
    const conversationHistoryForApi: { user: string; model: string }[] = [];
    let currentUserMessage = '';
  
    for (let i = 1; i < newChatHistory.length; i++) {
      const message = newChatHistory[i];
      if (message.role === 'user') {
        currentUserMessage = message.content;
        if (i === newChatHistory.length - 1) {
           conversationHistoryForApi.push({ user: currentUserMessage, model: '' });
        }
      } else if (message.role === 'model' && currentUserMessage) {
        conversationHistoryForApi.push({ user: currentUserMessage, model: message.content });
        currentUserMessage = '';
      }
    }
  
    const result = await continueConversationAction(
      item.title,
      conversationHistoryForApi
    );
  
    if (result.success) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', content: result.data.response },
      ]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setChatHistory(prev => prev.slice(0, -1));
    }
    setIsChatLoading(false);
  };
  
  const backUrl = itemType === 'mission' ? '/missions' : '/tasks';
  const backLabel = itemType === 'mission' ? 'Back to Missions' : 'Back to Tasks';

  if (isLoading || isItemLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Generating Your Roadmap...</h2>
        <p className="text-muted-foreground">The AI is crafting a personalized plan for your {itemType}.</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center">
         <Split className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive">
          {error ? 'Failed to Generate Roadmap' : `${itemType === 'task' ? 'Task' : 'Mission'} Not Found`}
        </h2>
        <p className="text-muted-foreground max-w-md mt-2">
          {error || `We couldn't find the ${itemType} you're looking for. It might have been deleted.`}
        </p>
        <Button onClick={() => router.push(backUrl)} className="mt-6">
          <ArrowLeft className="mr-2" />
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      <div className="lg:col-span-2 space-y-6">
        <Button variant="ghost" onClick={() => router.push(backUrl)} className="mb-4">
          <ArrowLeft className="mr-2" />
          {backLabel}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Roadmap: {item.title}</h1>
        {roadmap && (
          <Accordion type="multiple" defaultValue={roadmap.milestones.map(m => m.title)} className="w-full">
            {roadmap.milestones.map((milestone) => (
              <AccordionItem value={milestone.title} key={milestone.title}>
                <AccordionTrigger className="text-lg font-semibold">
                  <span className="mr-4 text-2xl">{milestone.emoji}</span> {milestone.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pl-8 py-2">
                    {milestone.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Checkbox id={`${milestone.title}-step-${index}`} className="mt-1" />
                        <label htmlFor={`${milestone.title}-step-${index}`} className="text-muted-foreground">{step}</label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
         {roadmap && (
          <p className="text-center text-lg font-semibold text-primary pt-4">{roadmap.conclusion}</p>
        )}
      </div>

      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot />
              AI Mentor Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 h-[400px] pr-4" ref={chatContainerRef}>
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <Bot className="h-6 w-6 text-accent flex-shrink-0" />}
                    <div className={`rounded-lg p-3 max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex items-start gap-3">
                     <Bot className="h-6 w-6 text-accent flex-shrink-0" />
                     <div className="rounded-lg p-3 bg-secondary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                     </div>
                   </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a follow-up question..."
                disabled={isChatLoading}
              />
              <Button onClick={handleSendMessage} disabled={isChatLoading || !userInput.trim()}>
                <Send />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
