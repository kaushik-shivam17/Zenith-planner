import { config } from 'dotenv';
config();

import '@/ai/flows/generate-study-schedule.ts';
import '@/ai/flows/suggest-optimal-study-times.ts';
import '@/ai/flows/break-down-large-tasks.ts';