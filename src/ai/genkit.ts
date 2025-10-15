import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY is not set. Please get your key from https://aistudio.google.com/app/apikey and set it in your .env file. You can also create a .env.example file with GEMINI_API_KEY="YOUR_API_KEY_HERE" as a template.'
  );
}

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
