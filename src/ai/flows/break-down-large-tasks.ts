'use server';

/**
 * @fileOverview Breaks down large tasks into smaller, manageable steps.
 *
 * - breakDownTask - A function that breaks down a large task into smaller steps.
 * - BreakDownTaskInput - The input type for the breakDownTask function.
 * - BreakDownTaskOutput - The return type for the breakDownTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakDownTaskInputSchema = z.object({
  task: z.string().describe('The large task to break down.'),
});
export type BreakDownTaskInput = z.infer<typeof BreakDownTaskInputSchema>;

const BreakDownTaskOutputSchema = z.object({
  steps: z.array(z.string()).describe('The smaller steps to complete the task.'),
});
export type BreakDownTaskOutput = z.infer<typeof BreakDownTaskOutputSchema>;

export async function breakDownTask(input: BreakDownTaskInput): Promise<BreakDownTaskOutput> {
  return breakDownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakDownTaskPrompt',
  input: {schema: BreakDownTaskInputSchema},
  output: {schema: BreakDownTaskOutputSchema},
  prompt: `You are a task management assistant. Your role is to break down large tasks into smaller, more manageable steps.

  Here is the task to break down:
  {{task}}

  Provide the steps as a numbered list.
  Example:
  1. Step 1
  2. Step 2
  3. Step 3`,
});

const breakDownTaskFlow = ai.defineFlow(
  {
    name: 'breakDownTaskFlow',
    inputSchema: BreakDownTaskInputSchema,
    outputSchema: BreakDownTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
