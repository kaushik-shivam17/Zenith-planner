'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BadgeCheck,
  Rocket,
  Calendar,
  User as UserIcon,
  LogOut,
  PlusCircle,
  CheckCircle2,
  Map,
  Keyboard,
  Sparkles,
} from 'lucide-react';

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import { useData } from '@/context/data-provider';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import { useToast } from '@/hooks/use-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, kbd: 'G D' },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck, kbd: 'G T' },
  { href: '/missions', label: 'Missions', icon: Rocket, kbd: 'G M' },
  { href: '/timetable', label: 'Timetable', icon: Calendar, kbd: 'G C' },
  { href: '/profile', label: 'Profile', icon: UserIcon, kbd: 'G P' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { tasks, toggleTaskCompletion } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === '?' && !isInputTarget(e.target)) {
        e.preventDefault();
        setShowShortcuts(true);
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('zenith:open-palette', onOpen as EventListener);
    return () => window.removeEventListener('zenith:open-palette', onOpen as EventListener);
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setShowShortcuts(false);
    setTimeout(fn, 50);
  }, []);

  const handleSignOut = async () => {
    try {
      await blink.auth.signOut();
      toast({ title: 'CONNECTION_TERMINATED', description: 'Session closed.' });
      router.push('/login');
    } catch {
      toast({ variant: 'destructive', title: 'ERROR', description: 'Failed to sign out.' });
    }
  };

  if (isAuthPage) return null;

  return (
    <CommandDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setShowShortcuts(false); }}>
      <CommandInput />
      <CommandList>
        <CommandEmpty>NO_RESULTS_FOUND</CommandEmpty>

        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={`nav ${item.label}`}
              onSelect={() => run(() => router.push(item.href))}
            >
              <item.icon className="text-primary/70" />
              <span>{item.label.toUpperCase()}</span>
              <CommandShortcut>{item.kbd}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="action new task inject"
            onSelect={() => run(() => {
              router.push('/tasks');
              setTimeout(() => window.dispatchEvent(new CustomEvent('zenith:new-task')), 250);
            })}
          >
            <PlusCircle className="text-primary/70" />
            <span>INJECT_TASK</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="action shortcuts help keyboard"
            onSelect={() => setShowShortcuts(true)}
          >
            <Keyboard className="text-primary/70" />
            <span>SHOW_KEYBOARD_SHORTCUTS</span>
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
          {user && (
            <CommandItem value="action sign out logout" onSelect={() => run(handleSignOut)}>
              <LogOut className="text-destructive/80" />
              <span>TERMINATE_SESSION</span>
            </CommandItem>
          )}
        </CommandGroup>

        {tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Tasks (${tasks.length})`}>
              {tasks.slice(0, 12).map((t) => (
                <CommandItem
                  key={t.id}
                  value={`task ${t.title} ${t.description ?? ''}`}
                  onSelect={() => run(() => router.push(`/roadmap/${t.id}`))}
                >
                  {t.completed ? (
                    <CheckCircle2 className="text-primary/40" />
                  ) : (
                    <Map className="text-primary/70" />
                  )}
                  <span className={t.completed ? 'line-through opacity-60' : ''}>
                    {t.title.toUpperCase()}
                  </span>
                  <CommandShortcut>OPEN_ROADMAP</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {showShortcuts && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Keyboard Shortcuts">
              <ShortcutRow keys={['⌘', 'K']} label="Open command palette" />
              <ShortcutRow keys={['G', 'D']} label="Go to Dashboard" />
              <ShortcutRow keys={['G', 'T']} label="Go to Tasks" />
              <ShortcutRow keys={['G', 'M']} label="Go to Missions" />
              <ShortcutRow keys={['G', 'C']} label="Go to Timetable (Calendar)" />
              <ShortcutRow keys={['G', 'P']} label="Go to Profile" />
              <ShortcutRow keys={['N']} label="New task" />
              <ShortcutRow keys={['?']} label="Show this help" />
              <ShortcutRow keys={['ESC']} label="Close palette" />
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="border-t border-primary/10 px-4 py-2 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest text-primary/40 uppercase">
          <Sparkles size={10} className="text-primary/60" />
          <span>ZENITH_PROTOCOL_BUS</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest text-muted-foreground/50 uppercase">
          <kbd className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-primary/60">↵</kbd>
          <span>SELECT</span>
          <kbd className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-primary/60">↑↓</kbd>
          <span>NAV</span>
        </div>
      </div>
    </CommandDialog>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs font-mono">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex items-center justify-center min-w-[24px] h-6 rounded border border-primary/20 bg-primary/5 px-1.5 text-[10px] tracking-widest text-primary/80"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function isInputTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  const tag = t.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
}
