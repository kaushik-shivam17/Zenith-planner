'use client';

import { useState, useEffect } from 'react';
import { Bed, Coffee, GlassWater, Lightbulb, Move } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PRODUCTIVITY_TIPS } from '@/lib/constants';

export function WellnessHub() {
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(
      PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)]
    );
  }, []);

  const reminders = [
    { icon: GlassWater, text: 'Hydrate' },
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
          {reminders.map((reminder) => (
            <div
              key={reminder.text}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-full bg-secondary">
                <reminder.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{reminder.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
