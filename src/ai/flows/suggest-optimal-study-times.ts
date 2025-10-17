'use server';

/**
 * @fileOverview Suggests optimal study times based on user preferences.
 *
 * - suggestOptimalStudyTimes - A function that suggests optimal study times.
 * - SuggestOptimalStudyTimesInput - The input type for the suggestOptimalStudyTimes function.
 * - SuggestOptimalStudyTimesOutput - The return type for the suggestOptimalStudyTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalStudyTimesInputSchema = z.object({
  studyLoad: z.string().describe('The amount of study material needed, e.g., light, medium, heavy.'),
  timeOfDayPreference: z.string().describe('The user\'s preferred time of day for studying, e.g., morning, afternoon, evening.'),
  focusLevel: z.string().describe('The user\'s typical focus level, e.g., high, medium, low.'),
  availableHours: z.number().describe('The number of hours the user has available for studying.'),
});
export type SuggestOptimalStudyTimesInput = z.infer<typeof SuggestOptimalStudyTimesInputSchema>;

const SuggestOptimalStudyTimesOutputSchema = z.object({
  suggestedTimes: z.string().describe('Suggested optimal study times based on the user input.'),
  reasoning: z.string().describe('The reasoning behind the suggested study times.'),
});
export type SuggestOptimalStudyTimesOutput = z.infer<typeof SuggestOptimalStudyTimesOutputSchema>;

export async function suggestOptimalStudyTimes(input: SuggestOptimalStudyTimesInput): Promise<SuggestOptimalStudyTimesOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your Vercel project settings.'
    );
  }
  return suggestOptimalStudyTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalStudyTimesPrompt',
  input: {schema: SuggestOptimalStudyTimesInputSchema},
  output: {schema: SuggestOptimalStudyTimesOutputSchema},
  prompt: `Based on the user's study preferences and availability, suggest the best times for them to focus and study.\n\nStudy Load: {{{studyLoad}}}\nTime of Day Preference: {{{timeOfDayPreference}}}\nFocus Level: {{{focusLevel}}}\nAvailable Hours: {{{availableHours}}}\n\nConsider these factors when suggesting times. Provide a brief explanation of why these times are optimal. Use relevant emojis (e.g., 🧠, 💡, ⏰) to make the suggestions more engaging.
Speak in short, clear sentences. Be helpful but not too chatty. Use a friendly, digital, calm tone like a quiet cyberpunk AI.\n`,
});

const suggestOptimalStudyTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalStudyTimesFlow',
    inputSchema: SuggestOptimalStudyTimesInputSchema,
    outputSchema: SuggestOptimalStudyTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
