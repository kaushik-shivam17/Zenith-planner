'use client';

import {
  BadgeCheck,
  Calendar,
  LayoutDashboard,
  LogIn,
  LogOut,
  Rocket,
  User as UserIcon,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { blink } from '@/blink/client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { NotificationManager } from './notification-manager';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: BadgeCheck },
  { href: '/missions', label: 'Missions', icon: Rocket },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
];

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { isMobile, setOpenMobile } = useSidebar();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  useAuthGuard(!isAuthPage);
  const { user } = useAuth();

  const { toast } = useToast();
  const isActive = (href: string) => pathname === href || (href === '/dashboard' && pathname === '/');

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await blink.auth.signOut();
      toast({
        title: 'CONNECTION_TERMINATED',
        description: 'Session has been securely closed.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
      toast({
        variant: 'destructive',
        title: 'ERROR',
        description: 'Failed to terminate session. Try again.',
      });
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Sidebar className="border-r border-primary/20 bg-card/50 backdrop-blur-xl">
        <SidebarHeader className="border-b border-primary/10">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 glow-primary">
              <Terminal className="text-primary h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter font-headline glow-primary text-primary">
                ZENITH_OS
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
                v1.0.4_STABLE
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href} onClick={handleLinkClick} className="px-2">
                <Link href={item.href} prefetch className="w-full" onMouseEnter={() => router.prefetch(item.href)}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    className={`w-full transition-colors duration-150 ${
                      isActive(item.href) 
                        ? 'bg-primary/20 text-primary border-r-2 border-primary glow-primary' 
                        : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'
                    }`}
                    tooltip={{
                      children: item.label,
                    }}
                  >
                    <item.icon className={isActive(item.href) ? 'text-primary' : ''} />
                    <span className="font-mono text-xs tracking-wider">{item.label.toUpperCase()}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="pt-2 border-t border-primary/10 bg-black/20">
          {user ? (
            <>
              <SidebarMenuItem onClick={handleLinkClick} className="px-2">
                <Link href="/profile" className="w-full">
                  <SidebarMenuButton
                    isActive={isActive('/profile')}
                    className="w-full flex items-center gap-2 hover:bg-primary/5 text-xs font-mono"
                  >
                    <UserIcon size={16} />
                    <span>USER_PROFILE</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem className="px-2">
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className="w-full text-destructive hover:bg-destructive/10 text-xs font-mono"
                >
                  <LogOut size={16} />
                  <span>TERMINATE_SESSION</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem onClick={handleLinkClick} className="px-2">
              <Link href="/login" className="w-full">
                <SidebarMenuButton
                  isActive={isActive('/login')}
                  className="w-full hover:bg-primary/5 text-muted-foreground hover:text-primary font-mono text-xs"
                >
                  <LogIn />
                  <span>LOGIN</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
           <div className="text-center text-xs text-muted-foreground p-4 mt-4 border-t border-sidebar-border">
            CREATED BY SHIVAM KAUSHIK
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="min-h-screen p-4 sm:p-6 md:p-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="md:hidden mb-4">
            <Header />
          </div>
          {user && <NotificationManager />}
          {children}
        </div>
      </main>
    </div>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppContent>{children}</AppContent>
    </SidebarProvider>
  );
}