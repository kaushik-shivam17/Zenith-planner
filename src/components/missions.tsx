import { Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function Missions() {
  const missions = [
    { title: 'Launch a startup', progress: 25 },
    { title: 'Run a marathon', progress: 50 },
    { title: 'Write a novel', progress: 10 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket />
          <span>Missions</span>
        </CardTitle>
        <CardDescription>Your ambitious, long-term missions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map((mission) => (
          <div key={mission.title}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{mission.title}</span>
              <span className="text-xs text-muted-foreground">{mission.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${mission.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
