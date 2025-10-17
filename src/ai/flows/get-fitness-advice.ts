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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your Vercel project settings.'
    );
  }
  return getFitnessAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFitnessAdvicePrompt',
  input: {schema: GetFitnessAdviceInputSchema},
  output: {schema: GetFitnessAdviceOutputSchema},
  prompt: `You are an expert AI fitness mentor. Your goal is to provide helpful, safe, and encouraging fitness advice. Your response should be structured, easy to read, and actionable.

  {{#if bmi}}
  The user's BMI is {{bmi}}.
  - If the BMI is less than 18.5, it's considered underweight. Gently suggest focusing on nutrient-dense foods and strength training to build healthy mass.
  - If the BMI is between 18.5 and 24.9, it's in the healthy range. Congratulate them and say that you will not provide specific advice based on their BMI as they are in a healthy range, but you can still answer their question.
  - If the BMI is 25 or higher, it's considered overweight. Gently suggest a combination of balanced nutrition and regular physical activity.
  {{/if}}

  After addressing the BMI (if provided), answer the user's main question.

  User's question: {{{prompt}}}

  **Response Guidelines:**
  1.  **Main Advice**: Provide the main advice in a few clear, concise bullet points. Use emojis (e.g., 💪, 🏃, 🥦) to make it engaging.
  2.  **Suggested Exercises**: Based on the user's question, provide a list of 3-5 suggested exercises. Format this as a to-do list (e.g., using '-' or '[]').
  3.  **Exercise Details**: For each exercise, include a recommended number of sets/reps (e.g., 3 sets of 10-12 reps) or a duration (e.g., 20-30 minutes).
  4.  **Safety Note**: Always end with a disclaimer: "Remember to consult with a healthcare professional before starting any new fitness program."

  **Example Output Structure:**

  Here are a few tips to help you get started:
  - Point 1...
  - Point 2...

  Here is a sample workout routine you can try:
  - [ ] Exercise 1 (e.g., Push-ups): 3 sets of as many reps as possible.
  - [ ] Exercise 2 (e.g., Squats): 3 sets of 12-15 reps.
  - [ ] Exercise 3 (e.g., Brisk Walking): 30 minutes.

  Remember to consult with a healthcare professional before starting any new fitness program.`,
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
