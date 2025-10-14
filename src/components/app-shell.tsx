'use client';

import {
  AppWindow,
  BadgeCheck,
  BrainCircuit,
  LayoutDashboard,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: '/missions', label: 'Missions', icon: Target },
  { href: '/focus', label: 'Focus AI', icon: BrainCircuit },
  { href: '/wellness', label: 'Wellness', icon: AppWindow },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter font-headline text-foreground">
                Zenith Planner
              </h1>
              <p className="text-xs text-muted-foreground">
                Become Master with us
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    className="w-full"
                    tooltip={{
                      children: item.label,
                    }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="md:hidden mb-4">
              <Header />
            </div>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
