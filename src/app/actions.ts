'use server';

import { ai } from '@/ai/genkit';
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
  generateTimetable,
  type GenerateTimetableInput,
  type GenerateTimetableOutput,
} from '@/ai/flows/generate-timetable';
import {
  getFitnessAdvice,
  type GetFitnessAdviceOutput,
} from '@/ai/flows/get-fitness-advice';
import { generateTaskRoadmap, type GenerateTaskRoadmapOutput } from '@/ai/flows/generate-task-roadmap';
import { continueConversation, type ContinueConversationOutput } from '@/ai/flows/continue-conversation';
import { suggestGoalsForMission, type SuggestGoalsForMissionOutput } from '@/ai/flows/suggest-goals-for-mission';
import type { Task as ClientTask } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';


type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const ensureAiReady = (): { ready: boolean; error?: string } => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || ai.listPlugins().length === 0) {
    return {
      ready: false,
      error:
        'The AI system is not configured. Please set the GEMINI_API_KEY in your Vercel project environment variables to use this feature.',
    };
  }
  return { ready: true };
};

export const generateScheduleAction = async (
  tasks: string
): Promise<ActionResult<GenerateStudyScheduleOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    const result = await generateStudySchedule({ tasks });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate schedule.' };
  }
};

export const breakDownTaskAction = async (
  task: string
): Promise<ActionResult<BreakDownTaskOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    const result = await breakDownTask({ task });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to break down task.' };
  }
};

export const suggestTimesAction = async (
  input: SuggestOptimalStudyTimesInput
): Promise<ActionResult<SuggestOptimalStudyTimesOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    const result = await suggestOptimalStudyTimes(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to suggest times.' };
  }
};

// This type is for what the client sends to the server action.
type ClientTimetableInputTask = {
  id: string;
  title: string;
  description?: string;
  deadline: Date | string; // Client might send Date or ISO string
  completed: boolean;
};

// The input for the generateTimetableAction now includes preferences.
type GenerateTimetableActionInput = {
  tasks: ClientTimetableInputTask[];
  customEvents: {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
  }[];
  preferences: GenerateTimetableInput['preferences'];
};

export const generateTimetableAction = async (
  input: GenerateTimetableActionInput
): Promise<ActionResult<GenerateTimetableOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    // Ensure deadline is a string for the AI flow
    const serializableTasks = input.tasks.map(task => ({
      ...task,
      deadline: typeof task.deadline === 'string' ? task.deadline : task.deadline.toISOString(),
    }));

    const result = await generateTimetable({ ...input, tasks: serializableTasks });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate timetable.' };
  }
};

export const getFitnessAdviceAction = async (
  prompt: string,
  bmi?: number
): Promise<ActionResult<GetFitnessAdviceOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    if (!prompt.trim()) {
      return { success: false, error: 'Please provide a question or topic for advice.' };
    }
    const result = await getFitnessAdvice({ prompt, bmi });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to get fitness advice.' };
  }
};

export const generateTaskRoadmapAction = async (
  taskTitle: string
): Promise<ActionResult<GenerateTaskRoadmapOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };
  try {
    const result = await generateTaskRoadmap({ taskTitle });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate roadmap.' };
  }
};

export const continueConversationAction = async (
  taskTitle: string,
  history: { user: string; model: string }[]
): Promise<ActionResult<ContinueConversationOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    const result = await continueConversation({ taskTitle, history });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to continue conversation.' };
  }
};


export const suggestGoalsForMissionAction = async (
  missionTitle: string
): Promise<ActionResult<SuggestGoalsForMissionOutput>> => {
  const readiness = ensureAiReady();
  if (!readiness.ready) return { success: false, error: readiness.error! };

  try {
    const result = await suggestGoalsForMission({ missionTitle });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to suggest goals.' };
  }
};
