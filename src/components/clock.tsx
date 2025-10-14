'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) {
      return '--:--:-- --';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };
  
  return (
    <div className="text-8xl font-bold font-mono tracking-widest text-primary">
      {formatTime(time)}
    </div>
  );
}
