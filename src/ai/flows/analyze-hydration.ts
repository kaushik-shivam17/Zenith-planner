'use server';

/**
 * @fileOverview Analyzes user's water intake and provides recommendations.
 *
 * - analyzeHydration - A function that analyzes the user's water intake.
 * - AnalyzeHydrationInput - The input type for the analyzeHydration function.
 * - AnalyzeHydrationOutput - The return type for the analyzeHydration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHydrationInputSchema = z.object({
  glassCount: z.number().describe('The number of glasses of water the user drank today.'),
});
export type AnalyzeHydrationInput = z.infer<typeof AnalyzeHydrationInputSchema>;

const AnalyzeHydrationOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A short, friendly analysis of the water intake and a recommendation.'),
});
export type AnalyzeHydrationOutput = z.infer<typeof AnalyzeHydrationOutputSchema>;

export async function analyzeHydration(
  input: AnalyzeHydrationInput
): Promise<AnalyzeHydrationOutput> {
  return analyzeHydrationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeHydrationPrompt',
  input: {schema: AnalyzeHydrationInputSchema},
  output: {schema: AnalyzeHydrationOutputSchema},
  prompt: `You are a health assistant. Analyze the user's water intake and provide a short, friendly recommendation. General advice is 8 glasses a day.

  Water glasses consumed: {{{glassCount}}}

  Provide a very brief (1-2 sentences) analysis. For example: "That's a great start! Aim for a few more glasses to stay fully hydrated." or "Excellent job staying hydrated today!". Be encouraging.`,
});

const analyzeHydrationFlow = ai.defineFlow(
  {
    name: 'analyzeHydrationFlow',
    inputSchema: AnalyzeHydrationInputSchema,
    outputSchema: AnalyzeHydrationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
