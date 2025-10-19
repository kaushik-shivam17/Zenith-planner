import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// The Gemini API key is optional. The app can start without it,
// but AI-related features will fail at runtime if the key is not provided.
const geminiApiKey = process.env.GEMINI_API_KEY;

export const ai = genkit({
  plugins: [
    // Conditionally add the googleAI plugin only if the API key is available.
    ...(geminiApiKey ? [googleAI({apiKey: geminiApiKey})] : []),
  ],
  // You can define a default model for your flows.
  // model: 'googleai/gemini-1.5-flash-latest',
});
