import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-primary/5 border border-primary/10',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-primary/15 before:to-transparent',
        className,
      )}
    />
  );
}

export function PageSkeleton({ title = 'LOADING_MODULE' }: { title?: string }) {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3 text-primary/70 font-mono text-xs tracking-[0.4em]">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        {title}
        <span className="ml-auto opacity-60">[ initializing ]</span>
      </div>
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  );
}
