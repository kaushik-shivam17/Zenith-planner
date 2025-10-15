'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = () => {
    const minutes = Math.floor((time / 60000) % 60).toString().padStart(2, '0');
    const seconds = Math.floor((time / 1000) % 60).toString().padStart(2, '0');
    const centiseconds = (Math.floor(time / 10) % 100).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${centiseconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-6xl md:text-8xl font-mono font-bold text-primary tracking-wider">
        {formatTime()}
      </div>
      <div className="flex items-center space-x-4">
        {isRunning ? (
          <Button onClick={handleStop} size="lg" variant="destructive" className="w-24">
            <Pause className="mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={handleStart} size="lg" className="w-24">
            <Play className="mr-2" />
            Start
          </Button>
        )}
        <Button onClick={handleReset} size="lg" variant="outline" className="w-24">
          <RotateCcw className="mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
