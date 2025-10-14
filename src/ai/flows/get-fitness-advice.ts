'use server';

/**
 * @fileOverview Provides fitness advice from an AI mentor.
 *
 * - getFitnessAdvice - A function that returns fitness advice.
 * - GetFitnessAdviceInput - The input type for the getFitnessAdvice function.
 * - GetFitnessAdviceOutput - The return type for the getFitnessAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFitnessAdviceInputSchema = z.object({
  prompt: z.string().describe('The user\'s question or prompt about fitness.'),
});
export type GetFitnessAdviceInput = z.infer<typeof GetFitnessAdviceInputSchema>;

const GetFitnessAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('The AI-generated fitness advice.'),
});
export type GetFitnessAdviceOutput = z.infer<typeof GetFitnessAdviceOutputSchema>;

export async function getFitnessAdvice(
  input: GetFitnessAdviceInput
): Promise<GetFitnessAdviceOutput> {
  return getFitnessAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFitnessAdvicePrompt',
  input: {schema: GetFitnessAdviceInputSchema},
  output: {schema: GetFitnessAdviceOutputSchema},
  prompt: `You are an expert AI fitness mentor. Your goal is to provide helpful, safe, and encouraging fitness advice.

  User's question: {{{prompt}}}

  Provide a clear and supportive answer. Use relevant emojis (e.g., 💪, 🏃, 🥦) to make your advice more engaging. Focus on general wellness, exercise principles, and nutrition tips. Do not provide medical advice, diagnose conditions, or create specific meal plans. If the user asks for medical advice, gently guide them to consult a healthcare professional.`,
});

const getFitnessAdviceFlow = ai.defineFlow(
  {
    name: 'getFitnessAdviceFlow',
    inputSchema: GetFitnessAdviceInputSchema,
    outputSchema: GetFitnessAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
