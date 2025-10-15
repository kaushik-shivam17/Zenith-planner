'use server';

/**
 * @fileOverview Suggests actionable goals for a given mission.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestGoalsForMissionInputSchema = z.object({
  missionTitle: z.string().describe('The title of the mission to generate goals for.'),
});
export type SuggestGoalsForMissionInput = z.infer<typeof SuggestGoalsForMissionInputSchema>;


const SuggestGoalsForMissionOutputSchema = z.object({
  goals: z.array(z.string()).describe('A list of 3-5 suggested, actionable goals to accomplish the mission.'),
});
export type SuggestGoalsForMissionOutput = z.infer<typeof SuggestGoalsForMissionOutputSchema>;


export async function suggestGoalsForMission(input: SuggestGoalsForMissionInput): Promise<SuggestGoalsForMissionOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return suggestGoalsForMissionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGoalsForMissionPrompt',
  input: { schema: SuggestGoalsForMissionInputSchema },
  output: { schema: SuggestGoalsForMissionOutputSchema },
  prompt: `You are a productivity expert. Your task is to break down a high-level mission into smaller, actionable goals.

Mission: {{{missionTitle}}}

Based on this mission, generate a list of 3-5 clear, concise, and actionable goals. Each goal should be a concrete step towards completing the overall mission.
`,
});

const suggestGoalsForMissionFlow = ai.defineFlow(
  {
    name: 'suggestGoalsForMissionFlow',
    inputSchema: SuggestGoalsForMissionInputSchema,
    outputSchema: SuggestGoalsForMissionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
