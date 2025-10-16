
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useToast } from '@/hooks/use-toast';
import { MissionsProvider } from '@/hooks/use-missions';
import { TasksProvider } from '@/hooks/use-tasks';
import { TimetableProvider } from '@/hooks/use-timetable';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: '/missions', label: 'Missions', icon: Rocket },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/focus', label: 'Focus AI', icon: BrainCircuit },
  { href: '/fitness', label: 'Fitness', icon: HeartPulse },
];

// Combine all protected routes into an array first
const protectedRoutePaths = [
  ...navItems.map(item => item.href),
  '/',
  '/profile',
  '/roadmap',
  '/missions/'
];
// Then create a Set from the array
const protectedAndDataRoutes = new Set(protectedRoutePaths);


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // A route is "protected" if it requires a user to be logged in.
  const isProtectedRoute = Array.from(protectedAndDataRoutes).some(route => pathname.startsWith(route));
  
  const { user, isUserLoading } = useUser();
  // useAuthGuard will handle redirection for protected routes
  useAuthGuard(isProtectedRoute);

  const { toast } = useToast();
  const isActive = (href: string) => pathname === href || (href === '/dashboard' && pathname === '/');

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
  
  // Strict loading gate. Do not render anything until auth state is confirmed.
  // This is the most critical part of the fix for the race condition.
  if (isUserLoading) {
    return (
       <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-2xl font-semibold text-foreground">Loading...</div>
      </div>
    );
  }

  // Determine if the current route needs data providers.
  // This is true if the route is protected AND the user is logged in.
  const needsProviders = isProtectedRoute && user;

  const mainContent = (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 flex-1">
      <div className="max-w-5xl mx-auto">
        <div className="md:hidden mb-4">
          <Header />
        </div>
        {children}
      </div>
    </main>
  );
  
  // Conditionally wrap the content with providers only when needed.
  const contentWithProviders = (
    <TimetableProvider>
      <MissionsProvider>
        <TasksProvider>
          {mainContent}
        </TasksProvider>
      </MissionsProvider>
    </TimetableProvider>
  );

  return (
    <SidebarProvider>
       <div className="flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 p-2">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tighter font-headline">
                  Zenith Planner
                </h1>
                <p className="text-xs text-muted-foreground">
                  Your AI-powered assistant
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
          <SidebarFooter className="pt-2">
             {/* We don't need a loading skeleton here anymore because the main gate handles it */}
            {user ? (
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
        {needsProviders ? contentWithProviders : mainContent}
      </div>
    </SidebarProvider>
  );
}
