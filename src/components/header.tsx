import { Target } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex items-center gap-4">
       <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter font-headline text-foreground">
          Zenith Planner
        </h1>
      </div>
    </header>
  );
}
