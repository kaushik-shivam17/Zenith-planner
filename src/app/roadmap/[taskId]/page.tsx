import { RoadmapContent } from '@/components/roadmap-content';

export default function RoadmapPage({ params }: { params: { taskId: string } }) {
  // This page can be a server component that passes params to a client component
  return <RoadmapContent taskId={params.taskId} />;
}
