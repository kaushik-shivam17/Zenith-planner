'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setProgress(8);
    timers.current.push(window.setTimeout(() => setProgress(45), 60));
    timers.current.push(window.setTimeout(() => setProgress(78), 220));
    timers.current.push(window.setTimeout(() => setProgress(96), 480));
    timers.current.push(window.setTimeout(() => {
      setProgress(100);
      timers.current.push(window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 180));
    }, 650));

    return () => { timers.current.forEach(clearTimeout); };
  }, [pathname, search]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${progress}%`,
          transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.4)',
        }}
      />
    </div>
  );
}

export function ScrollToTop() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
