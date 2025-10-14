'use server';

import {
  generateStudySchedule,
  type GenerateStudyScheduleOutput,
} from '@/ai/flows/generate-study-schedule';
import {
  breakDownTask,
  type BreakDownTaskOutput,
} from '@/ai/flows/break-down-large-tasks';
import {
  suggestOptimalStudyTimes,
  type SuggestOptimalStudyTimesInput,
  type SuggestOptimalStudyTimesOutput,
} from '@/ai/flows/suggest-optimal-study-times';
import {
  analyzeHydration,
  type AnalyzeHydrationOutput,
} from '@/ai/flows/analyze-hydration';
import {
  generateTimetable,
  type GenerateTimetableInput,
  type GenerateTimetableOutput,
} from '@/ai/flows/generate-timetable';
import {
  getFitnessAdvice,
  type GetFitnessAdviceOutput,
} from '@/ai/flows/get-fitness-advice';
import type { Task } from '@/lib/types';


type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export const generateScheduleAction = async (
  tasks: string
): Promise<ActionResult<GenerateStudyScheduleOutput>> => {
  try {
    const result = await generateStudySchedule({ tasks });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate schedule. The AI system may be offline.' };
  }
};

export const breakDownTaskAction = async (
  task: string
): Promise<ActionResult<BreakDownTaskOutput>> => {
  try {
    const result = await breakDownTask({ task });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to break down task. The AI system may be offline.' };
  }
};

export const suggestTimesAction = async (
  input: SuggestOptimalStudyTimesInput
): Promise<ActionResult<SuggestOptimalStudyTimesOutput>> => {
  try {
    const result = await suggestOptimalStudyTimes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to suggest times. The AI system may be offline.' };
  }
};

export const analyzeHydrationAction = async (
  glassCount: number
): Promise<ActionResult<AnalyzeHydrationOutput>> => {
  try {
    const result = await analyzeHydration({ glassCount });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to analyze hydration. The AI system may be offline.' };
  }
};

type GenerateTimetableActionInput = {
  tasks: Task[];
  customEvents: {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
  }[];
};

export const generateTimetableAction = async (
  input: GenerateTimetableActionInput
): Promise<ActionResult<GenerateTimetableOutput>> => {
  try {
    // Convert Date objects to string to make them serializable for the AI flow
    const serializableTasks = input.tasks.map(task => ({
      ...task,
      deadline: task.deadline.toISOString(),
    }));

    const result = await generateTimetable({ ...input, tasks: serializableTasks });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate timetable. The AI system may be offline.' };
  }
};

export const getFitnessAdviceAction = async (
  prompt: string
): Promise<ActionResult<GetFitnessAdviceOutput>> => {
  try {
    const result = await getFitnessAdvice({ prompt });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get fitness advice. The AI system may be offline.' };
  }
};
