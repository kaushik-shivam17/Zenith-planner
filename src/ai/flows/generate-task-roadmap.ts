'use server';

/**
 * @fileOverview Generates a detailed roadmap for a given task.
 *
 * - generateTaskRoadmap - A function that creates a personalized roadmap.
 * - GenerateTaskRoadmapInput - The input type for the function.
 * - GenerateTaskRoadmapOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTaskRoadmapInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task to create a roadmap for.'),
});
export type GenerateTaskRoadmapInput = z.infer<typeof GenerateTaskRoadmapInputSchema>;

const MilestoneSchema = z.object({
  title: z.string().describe('The title of the milestone.'),
  emoji: z.string().describe('A single emoji that represents the milestone.'),
  steps: z.array(z.string()).describe('A list of actionable steps to complete the milestone.'),
});

const GenerateTaskRoadmapOutputSchema = z.object({
  introduction: z.string().describe('A brief, encouraging introduction to the roadmap.'),
  milestones: z.array(MilestoneSchema).describe('A list of milestones to complete the task.'),
  conclusion: z.string().describe('A final motivating sentence to encourage the user.'),
});
export type GenerateTaskRoadmapOutput = z.infer<typeof GenerateTaskRoadmapOutputSchema>;

export async function generateTaskRoadmap(input: GenerateTaskRoadmapInput): Promise<GenerateTaskRoadmapOutput> {
    if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return generateTaskRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskRoadmapPrompt',
  input: { schema: GenerateTaskRoadmapInputSchema },
  output: { schema: GenerateTaskRoadmapOutputSchema },
  prompt: `You are an expert project manager and motivational coach AI. Your goal is to create a clear, inspiring, and actionable roadmap for the user's task.

Task: {{{taskTitle}}}

Generate a roadmap with the following structure:
1.  **Introduction**: A short, encouraging sentence to get the user started.
2.  **Milestones**: Break the task into 3-5 logical milestones. Each milestone should have:
    *   A clear `title`.
    *   A single, relevant `emoji` that fits the milestone's theme.
    *   A list of 3-5 concrete `steps` to achieve the milestone.
3.  **Conclusion**: A final motivational sentence to inspire the user to begin.

Make the language positive and action-oriented. The goal is to make the user feel confident and prepared to tackle their task.`,
});

const generateTaskRoadmapFlow = ai.defineFlow(
  {
    name: 'generateTaskRoadmapFlow',
    inputSchema: GenerateTaskRoadmapInputSchema,
    outputSchema: GenerateTaskRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
