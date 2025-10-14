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
  prompt: z.string().describe("The user's question or prompt about fitness."),
  bmi: z.number().optional().describe("The user's Body Mass Index (BMI)."),
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

  {{#if bmi}}
  The user's BMI is {{bmi}}.
  - If the BMI is less than 18.5, it's considered underweight. Gently suggest focusing on nutrient-dense foods and strength training to build healthy mass.
  - If the BMI is between 18.5 and 24.9, it's in the healthy range. Congratulate them and say that you will not provide specific advice based on their BMI as they are in a healthy range, but you can still answer their question.
  - If the BMI is 25 or higher, it's considered overweight. Gently suggest a combination of balanced nutrition and regular physical activity, like brisk walking or cycling.

  After addressing the BMI (if provided), answer the user's main question.
  {{/if}}

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
