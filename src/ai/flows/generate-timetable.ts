'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a timetable based on user tasks and fixed events.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  deadline: z.string(), // Using string for date
  completed: z.boolean(),
});

const CustomEventSchema = z.object({
  title: z.string(),
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const GenerateTimetableInputSchema = z.object({
  tasks: z.array(TaskSchema).describe("A list of tasks to schedule."),
  customEvents: z.array(CustomEventSchema).describe("A list of fixed events like classes or appointments."),
  preferences: z.object({
    studyTime: z.string().describe("User's preferred study time (e.g., 'morning', 'evening')."),
    energyLevel: z.string().describe("User's energy level pattern (e.g., 'high in morning', 'energized after lunch')."),
    sessionLength: z.string().describe("User's preferred study session length (e.g., 'short 30-min bursts', 'long 90-min blocks')."),
  }).describe("User's study preferences.")
});
export type GenerateTimetableInput = z.infer<typeof GenerateTimetableInputSchema>;

const TimetableEventSchema = z.object({
  title: z.string().describe("The title of the task to be scheduled."),
  day: z.string().describe("The day of the week for the event (e.g., 'Monday', 'Tuesday')."),
  startTime: z.string().describe("The start time of the event (e.g., '9:00 AM')."),
  endTime: z.string().describe("The end time of the event (e.g., '10:00 AM')."),
});

const GenerateTimetableOutputSchema = z.object({
  timetable: z.array(TimetableEventSchema).describe("The generated timetable with scheduled tasks."),
});
export type GenerateTimetableOutput = z.infer<typeof GenerateTimetableOutputSchema>;

export async function generateTimetable(input: GenerateTimetableInput): Promise<GenerateTimetableOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return generateTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTimetablePrompt',
  input: {schema: GenerateTimetableInputSchema},
  output: {schema: GenerateTimetableOutputSchema},
  prompt: `You are an expert scheduler AI. Your goal is to create an optimal study schedule as a timetable, personalized to the user's preferences.

You will be given a list of tasks with their deadlines, a list of fixed custom events (like classes or appointments), and the user's study preferences.

You need to schedule the active (not completed) tasks into the available time slots, avoiding the times already taken by custom events.

**Crucially, you must tailor the schedule based on the user's preferences.**

The available days are: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
The available time slots are in 1-hour increments from 8:00 AM to 8:00 PM.

Only schedule tasks. Do not include the custom events in the output. Your output should only be the new study blocks for the tasks.

Here are the user's details:
- Tasks: {{{json tasks}}}
- Custom Events: {{{json customEvents}}}
- User Preferences:
  - Preferred Study Time: {{{preferences.studyTime}}}
  - Energy Levels: {{{preferences.energyLevel}}}
  - Preferred Session Length: {{{preferences.sessionLength}}}

Generate a timetable by filling in the 'timetable' array. Ensure that the start and end times are exactly one hour apart and align with the provided time slots (e.g., '9:00 AM' to '10:00 AM'). Do not schedule tasks overlapping with custom events. Prioritize scheduling based on deadlines and user preferences. For example, if the user has high energy in the morning, schedule more demanding tasks then.
`,
});


const generateTimetableFlow = ai.defineFlow(
  {
    name: 'generateTimetableFlow',
    inputSchema: GenerateTimetableInputSchema,
    outputSchema: GenerateTimetableOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
