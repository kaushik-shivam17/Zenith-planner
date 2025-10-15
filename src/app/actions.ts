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
  generateTimetable,
  type GenerateTimetableOutput,
} from '@/ai/flows/generate-timetable';
import {
  getFitnessAdvice,
  type GetFitnessAdviceOutput,
} from '@/ai/flows/get-fitness-advice';
import { generateTaskRoadmap, type GenerateTaskRoadmapOutput } from '@/ai/flows/generate-task-roadmap';
import { continueConversation, type ContinueConversationOutput } from '@/ai/flows/continue-conversation';
import type { Task as ClientTask } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';


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
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to break down task. The AI system may be offline.' };
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

// This type is for what the client sends to the server action.
type ClientTimetableInputTask = {
  id: string;
  title: string;
  details?: string;
  deadline: Date | string; // Client might send Date or ISO string
  completed: boolean;
};


type GenerateTimetableActionInput = {
  tasks: ClientTimetableInputTask[];
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
    // Ensure deadline is a string for the AI flow
    const serializableTasks = input.tasks.map(task => ({
      ...task,
      deadline: typeof task.deadline === 'string' ? task.deadline : task.deadline.toISOString(),
    }));

    const result = await generateTimetable({ ...input, tasks: serializableTasks });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate timetable. The AI system may be offline.' };
  }
};

export const getFitnessAdviceAction = async (
  prompt: string,
  bmi?: number
): Promise<ActionResult<GetFitnessAdviceOutput>> => {
  try {
    const result = await getFitnessAdvice({ prompt, bmi });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get fitness advice. The AI system may be offline.' };
  }
};

export const generateTaskRoadmapAction = async (
  taskTitle: string
): Promise<ActionResult<GenerateTaskRoadmapOutput>> => {
  try {
    const result = await generateTaskRoadmap({ taskTitle });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate roadmap. The AI system may be offline.' };
  }
};

export const continueConversationAction = async (
  taskTitle: string,
  history: { user: string; model: string }[]
): Promise<ActionResult<ContinueConversationOutput>> => {
  try {
    const result = await continueConversation({ taskTitle, history });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to continue conversation. The AI system may be offline.' };
  }
};
