'use server';

/**
 * @fileOverview Continues a conversation about a specific task roadmap.
 *
 * - continueConversation - A function that takes conversation history and a new prompt.
 * - ContinueConversationInput - The input type for the function.
 * - ContinueConversationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HistoryItemSchema = z.object({
  user: z.string(),
  model: z.string(),
});

const ContinueConversationInputSchema = z.object({
  taskTitle: z.string().describe('The original task the conversation is about.'),
  history: z.array(HistoryItemSchema).describe('The history of the conversation so far.'),
});
export type ContinueConversationInput = z.infer<typeof ContinueConversationInputSchema>;

const ContinueConversationOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s last message.'),
});
export type ContinueConversationOutput = z.infer<typeof ContinueConversationOutputSchema>;

export async function continueConversation(input: ContinueConversationInput): Promise<ContinueConversationOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return continueConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueConversationPrompt',
  input: { schema: ContinueConversationInputSchema },
  output: { schema: ContinueConversationOutputSchema },
  prompt: `You are an expert project manager and motivational coach AI. You are continuing a conversation with a user about the roadmap for their task: "{{taskTitle}}".

The user has questions or wants clarification. Your role is to be helpful, encouraging, and provide clear answers based on the conversation history. Keep your answers concise and focused on the user's question.

{{#each history}}
User: {{{user}}}
You: {{{model}}}
{{/each}}

User: {{{history[history.length-1].user}}}
You:`,
});

const continueConversationFlow = ai.defineFlow(
  {
    name: 'continueConversationFlow',
    inputSchema: ContinueConversationInputSchema,
    outputSchema: ContinueConversationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
