import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

export const ai = genkit({
  plugins: [geminiApiKey ? googleAI({apiKey: geminiApiKey}) : undefined].filter(p => p),
  model: 'googleai/gemini-2.5-flash',
});
