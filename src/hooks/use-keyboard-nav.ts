'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ROUTES: Record<string, string> = {
  d: '/dashboard',
  t: '/tasks',
  m: '/missions',
  c: '/timetable',
  p: '/profile',
};

function isInputTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  const tag = t.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}

export function useKeyboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingG = useRef<number | null>(null);

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return;

    const onKey = (e: KeyboardEvent) => {
      if (isInputTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();

      if (pendingG.current && ROUTES[k]) {
        e.preventDefault();
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        router.push(ROUTES[k]);
        return;
      }

      if (k === 'g') {
        e.preventDefault();
        if (pendingG.current) window.clearTimeout(pendingG.current);
        pendingG.current = window.setTimeout(() => {
          pendingG.current = null;
        }, 1200);
        return;
      }

      if (k === 'n') {
        e.preventDefault();
        if (pathname !== '/tasks') router.push('/tasks');
        setTimeout(() => window.dispatchEvent(new CustomEvent('zenith:new-task')), pathname === '/tasks' ? 0 : 300);
        return;
      }

      if (pendingG.current) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (pendingG.current) window.clearTimeout(pendingG.current);
    };
  }, [pathname, router]);
}
