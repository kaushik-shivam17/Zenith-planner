import { blink } from '@/blink/client';
import { z } from 'zod';

export const MilestoneSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  steps: z.array(z.string()),
});

export const RoadmapOutputSchema = z.object({
  introduction: z.string(),
  milestones: z.array(MilestoneSchema),
  conclusion: z.string(),
});

export type RoadmapOutput = z.infer<typeof RoadmapOutputSchema>;

export async function generateTaskRoadmap(taskTitle: string): Promise<RoadmapOutput> {
  const result = await blink.ai.generateObject({
    model: 'google/gemini-2.0-flash',
    schema: RoadmapOutputSchema,
    prompt: `You are an elite cybernetic project architect. Your mission is to decode the task "${taskTitle}" and generate a high-performance roadmap.
    
    Structure the response as:
    1. Introduction: A sharp, futuristic motivation sentence.
    2. Milestones: 3-5 critical mission phases. Each with a title, a single cyber/tech emoji, and 3-5 actionable sub-protocols (steps).
    3. Conclusion: A final directive to initiate the sequence.
    
    Use a professional, high-tech, cyber-hacker aesthetic in your language.`,
  });
  return result.object;
}

export const StudyScheduleSchema = z.object({
  sessions: z.array(z.object({
    subject: z.string(),
    duration: z.string(),
    focus: z.string(),
    break: z.string(),
  })),
  tips: z.array(z.string()),
});

export async function generateStudySchedule(goal: string): Promise<z.infer<typeof StudyScheduleSchema>> {
  const result = await blink.ai.generateObject({
    model: 'google/gemini-2.0-flash',
    schema: StudyScheduleSchema,
    prompt: `Generate an optimized neuro-sync study schedule for the goal: "${goal}".
    
    Break it down into high-intensity sessions with focus areas and tactical breaks.
    Provide 3-5 bio-hacking tips for maximum cognitive performance.
    Theme: Cybernetic optimization.`,
  });
  return result.object;
}

export const FitnessAdviceSchema = z.object({
  workout: z.string(),
  nutrition: z.string(),
  recovery: z.string(),
  biometricTip: z.string(),
});

export async function getFitnessAdvice(goal: string): Promise<z.infer<typeof FitnessAdviceSchema>> {
  const result = await blink.ai.generateObject({
    model: 'google/gemini-2.0-flash',
    schema: FitnessAdviceSchema,
    prompt: `Analyze the fitness objective: "${goal}" and provide a bio-sync optimization protocol.
    
    Include:
    1. Workout: A high-impact physical routine.
    2. Nutrition: Fueling protocol for peak efficiency.
    3. Recovery: System maintenance steps.
    4. Biometric Tip: A futuristic health-hack.`,
  });
  return result.object;
}

export const MissionGoalsSchema = z.object({
  goals: z.array(z.string()),
});

export async function suggestMissionGoals(missionTitle: string): Promise<string[]> {
  const result = await blink.ai.generateObject({
    model: 'google/gemini-2.0-flash',
    schema: MissionGoalsSchema,
    prompt: `You are the Mission Control AI. The operator has initiated a new mission: "${missionTitle}".
    
    Generate 5-8 tactical sub-goals (short titles) required to successfully complete this operation.
    Theme: Tactical, high-stakes, cybernetic mission planning.`,
  });
  return result.object.goals;
}

export const TimetableSchema = z.object({
  timetable: z.array(z.object({
    title: z.string(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
});

export async function generateTimetable(input: { 
  tasks: any[], 
  customEvents: any[], 
  preferences: any 
}): Promise<any[]> {
  const result = await blink.ai.generateObject({
    model: 'google/gemini-2.0-flash',
    schema: TimetableSchema,
    prompt: `You are a high-performance scheduling algorithm. Your mission is to synchronize study blocks with existing fixed nodes.
    
    TASKS: ${JSON.stringify(input.tasks)}
    FIXED_NODES: ${JSON.stringify(input.customEvents)}
    USER_PREFS: ${JSON.stringify(input.preferences)}
    
    TIME_SLOTS: 8:00 AM to 8:00 PM (hourly increments).
    DAYS: Monday to Sunday.
    
    RULES:
    1. Do NOT overlap with FIXED_NODES.
    2. Respect user PREFS for study times and session lengths.
    3. Distribute tasks logically across the week based on deadlines.
    
    Return a list of study blocks (title, day, startTime, endTime).`,
  });
  return result.object.timetable;
}