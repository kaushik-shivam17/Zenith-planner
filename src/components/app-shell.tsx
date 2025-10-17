'use client';

import {
  BadgeCheck,
  BrainCircuit,
  Calendar,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
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
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: '/missions', label: 'Missions', icon: Rocket },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/focus', label: 'Focus AI', icon: BrainCircuit },
  { href: '/fitness', label: 'Fitness', icon: HeartPulse },
];

const protectedRoutePaths = [
  ...navItems.map(item => item.href),
  '/',
  '/profile',
  '/roadmap',
  '/missions/',
];
const protectedAndDataRoutes = new Set(protectedRoutePaths);


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isProtectedRoute = Array.from(protectedAndDataRoutes).some(route => pathname.startsWith(route));
  
  const { user } = useUser();
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
  
  // The rendering is now gated by FirebaseClientProvider.
  // The AppShell only renders when it's supposed to, and useAuthGuard handles redirection.
  if (!user && isProtectedRoute) {
    return null; // Return null to prevent rendering the shell on protected routes without a user.
  }

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
            {user ? (
              <>
                <SidebarMenuItem>
                  <Link href="/profile" className="w-full">
                    <SidebarMenuButton
                      isActive={isActive('/profile')}
                      className="w-full flex items-center gap-2"
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
        {mainContent}
      </div>
    </SidebarProvider>
  );
}
