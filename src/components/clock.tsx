'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []); // The empty dependency array ensures this runs only once on mount.

  const formatTime = (date: Date | null) => {
    if (!date) {
      // Return a placeholder or empty string while waiting for client-side render
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
    <div className="text-5xl sm:text-6xl md:text-8xl font-bold font-mono tracking-widest text-primary">
      {formatTime(time)}
    </div>
  );
}
