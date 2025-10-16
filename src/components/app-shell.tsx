'use client';

import {
  BadgeCheck,
  BrainCircuit,
  Calendar,
  HeartPulse,
  LayoutDashboard,
  LogIn,
  LogOut,
  Rocket,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: '/missions', label: 'Missions', icon: Rocket },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/focus', label: 'Focus AI', icon: BrainCircuit },
  { href: '/fitness', label: 'Fitness', icon: HeartPulse },
];

const protectedRoutes = new Set(navItems.map(item => item.href));


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useAuthGuard(protectedRoutes.has(pathname));
  const { toast } = useToast();
  const isActive = (href: string) => pathname === href;
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  if (!isClient) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
         {/* You can replace this with a more sophisticated skeleton loader */}
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter font-headline text-foreground">
                Zenith Planner
              </h1>
              <p className="text-xs text-muted-foreground">
                Become Pro with us
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
        <SidebarFooter>
          {isUserLoading ? (
            <div className="p-4">
              <div className="h-8 bg-gray-700 rounded w-full animate-pulse" />
            </div>
          ) : user ? (
            <>
              <SidebarMenuItem>
                <Link href="/profile" className="w-full">
                  <SidebarMenuButton
                    isActive={isActive('/profile')}
                    className="w-full"
                  >
                    <UserIcon />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="w-full">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <Link href="/login" className="w-full">
                <SidebarMenuButton
                  isActive={isActive('/login')}
                  className="w-full"
                >
                  <LogIn />
                  <span>Login</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto fade-in">
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
