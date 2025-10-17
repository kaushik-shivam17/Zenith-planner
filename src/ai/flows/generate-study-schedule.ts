'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a study schedule based on user tasks and deadlines.
 *
 * The flow takes tasks and deadlines as input and returns a generated study schedule.
 * - generateStudySchedule - A function that generates a study schedule.
 * - GenerateStudyScheduleInput - The input type for the generateStudySchedule function.
 * - GenerateStudyScheduleOutput - The return type for the generateStudySchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyScheduleInputSchema = z.object({
  tasks: z
    .string()
    .describe('A list of tasks with deadlines and details, separated by commas.'),
});

export type GenerateStudyScheduleInput = z.infer<typeof GenerateStudyScheduleInputSchema>;

const GenerateStudyScheduleOutputSchema = z.object({
  schedule: z.string().describe('The generated study schedule.'),
});

export type GenerateStudyScheduleOutput = z.infer<typeof GenerateStudyScheduleOutputSchema>;

export async function generateStudySchedule(input: GenerateStudyScheduleInput): Promise<GenerateStudyScheduleOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your Vercel project settings.'
    );
  }
  return generateStudyScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudySchedulePrompt',
  input: {schema: GenerateStudyScheduleInputSchema},
  output: {schema: GenerateStudyScheduleOutputSchema},
  prompt: `You are a study schedule generator AI, tasked with generating a study schedule based on the user's tasks and deadlines.

  Tasks and Deadlines: {{{tasks}}}

  Generate a clear and practical study schedule. Use relevant emojis (e.g., 📚, 🎯, ✨) to make the schedule more engaging.
  Speak in short, clear sentences. Be helpful but not too chatty. Use a friendly, digital, calm tone like a quiet cyberpunk AI.
  Do NOT talk about games, levels, experience points, or fantasy. Keep everything about real life and real progress.`,
});

const generateStudyScheduleFlow = ai.defineFlow(
  {
    name: 'generateStudyScheduleFlow',
    inputSchema: GenerateStudyScheduleInputSchema,
    outputSchema: GenerateStudyScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
