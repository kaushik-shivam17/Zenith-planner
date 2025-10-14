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
