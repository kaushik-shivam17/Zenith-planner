'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bed,
  Coffee,
  GlassWater,
  Lightbulb,
  Loader2,
  Minus,
  Move,
  Plus,
  Sparkles,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PRODUCTIVITY_TIPS } from '@/lib/constants';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeHydrationAction } from '@/app/actions';

export function WellnessHub() {
  const [tip, setTip] = useState('');
  const [waterCount, setWaterCount] = useState(0);
  const [hydrationAnalysis, setHydrationAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTip(
      PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)]
    );
  }, []);

  const handleWaterIncrement = () => setWaterCount(waterCount + 1);
  const handleWaterDecrement = () => setWaterCount(Math.max(0, waterCount - 1));

  const handleHydrationAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setHydrationAnalysis('');
    const result = await analyzeHydrationAction(waterCount);
    if (result.success && result.data) {
      setHydrationAnalysis(result.data.analysis);
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    }
    setIsAnalyzing(false);
  }, [waterCount, toast]);

  const staticReminders = [
    { icon: Move, text: 'Move' },
    { icon: Coffee, text: 'Break' },
    { icon: Bed, text: 'Rest' },
  ];

  return (
    <Card className="bg-card/50 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="text-accent" />
          <span>System Prompts</span>
        </CardTitle>
        <CardDescription>
          Gentle reminders for maintaining peak performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground italic">"{tip}"</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-2 p-2 rounded-md bg-secondary/50 border">
            <div className="p-3 rounded-full bg-secondary">
              <GlassWater className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Hydrate</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleWaterDecrement}
                className="h-6 w-6"
                disabled={isAnalyzing}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold">{waterCount}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleWaterIncrement}
                className="h-6 w-6"
                disabled={isAnalyzing}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-8"
              onClick={handleHydrationAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-2">Analyze</span>
            </Button>
          </div>

          {staticReminders.map((reminder) => (
            <div
              key={reminder.text}
              className="flex flex-col items-center gap-2 justify-center"
            >
              <div className="p-3 rounded-full bg-secondary">
                <reminder.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{reminder.text}</span>
            </div>
          ))}
        </div>
        {hydrationAnalysis && (
          <div className="p-3 rounded-md bg-accent/10 border border-accent/20">
            <p className="text-sm text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
              <strong className="text-accent">AI Hydration Coach:</strong> {hydrationAnalysis}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
