'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BadgeCheck, Rocket, Calendar, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: null, label: 'Search', icon: Search, action: 'palette' as const },
  { href: '/missions', label: 'Missions', icon: Rocket },
  { href: '/timetable', label: 'Schedule', icon: Calendar },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname === '/signup') return null;

  const isActive = (href: string | null) =>
    !!href && (pathname === href || (href === '/dashboard' && pathname === '/'));

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-primary/20 bg-card/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 px-1 pt-1.5 pb-2">
        {items.map((item) => {
          const Active = isActive(item.href);
          const isCenter = item.action === 'palette';
          const Inner = (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors',
                Active && 'bg-primary/10',
                isCenter && 'bg-primary/15 border border-primary/30 -mt-3 shadow-[0_0_18px_hsl(var(--primary)/0.4)]'
              )}
            >
              <item.icon
                size={isCenter ? 20 : 18}
                className={cn(
                  'transition-colors',
                  Active ? 'text-primary' : isCenter ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-mono tracking-widest uppercase transition-colors',
                  Active ? 'text-primary' : isCenter ? 'text-primary/80' : 'text-muted-foreground/70'
                )}
              >
                {item.label}
              </span>
            </div>
          );

          return (
            <li key={item.label} className="px-1">
              {item.action === 'palette' ? (
                <button
                  type="button"
                  className="w-full"
                  onClick={() => window.dispatchEvent(new CustomEvent('zenith:open-palette'))}
                  aria-label="Open command palette"
                >
                  {Inner}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  prefetch
                  className="w-full block"
                  onMouseEnter={() => router.prefetch(item.href!)}
                >
                  {Inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
