import { Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function Goals() {
  const goals = [
    { title: 'Master Calculus', progress: 75 },
    { title: 'Learn Spanish Fluently', progress: 40 },
    { title: 'Build a Web App', progress: 90 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target />
          <span>Goals</span>
        </CardTitle>
        <CardDescription>Your long-term goals and progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.title}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{goal.title}</span>
              <span className="text-xs text-muted-foreground">{goal.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
