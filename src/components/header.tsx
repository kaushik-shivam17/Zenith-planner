import { Target } from 'lucide-react';

export function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <Target className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter font-headline text-foreground">
          Zenith Planner
        </h1>
      </div>
      <p className="text-muted-foreground">Become Master with us</p>
    </header>
  );
}
