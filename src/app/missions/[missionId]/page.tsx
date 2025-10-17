import { MissionDetailContent } from '@/components/mission-detail-content';

export default function MissionDetailPage({ params }: { params: { missionId: string } }) {
    return <MissionDetailContent missionId={params.missionId} />;
}
