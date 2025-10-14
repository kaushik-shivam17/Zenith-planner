import { Clock } from '@/components/clock';

export function Dashboard() {
  return (
    <div className="space-y-8 flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Clock />
      <h1 className="text-4xl font-bold tracking-tight text-center">
        Welcome to Zenith Planner
      </h1>
      <p className="text-lg text-muted-foreground text-center">
        Select a tool from the sidebar to get started.
      </p>
    </div>
  );
}
