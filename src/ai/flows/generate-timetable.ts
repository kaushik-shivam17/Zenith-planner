'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a timetable based on user tasks and fixed events.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  details: z.string().optional(),
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
  return generateTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTimetablePrompt',
  input: {schema: GenerateTimetableInputSchema},
  output: {schema: GenerateTimetableOutputSchema},
  prompt: `You are an expert scheduler AI. Your goal is to create an optimal study schedule as a timetable.

You will be given a list of tasks with their deadlines and a list of fixed custom events (like classes or appointments).

You need to schedule the active (not completed) tasks into the available time slots, avoiding the times already taken by custom events.

Consider the task deadlines and try to schedule tasks logically. Break down larger tasks into 1-hour study blocks if necessary. For example, if a task is 'Study for History Exam', you can create multiple 'Study: History Exam' blocks.

The available days are: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
The available time slots are in 1-hour increments from 8:00 AM to 8:00 PM.

Only schedule tasks. Do not include the custom events in the output. Your output should only be the new study blocks for the tasks.

Here are the user's details:
- Tasks: {{{json tasks}}}
- Custom Events: {{{json customEvents}}}

Generate a timetable by filling in the 'timetable' array. Ensure that the start and end times are exactly one hour apart and align with the provided time slots (e.g., '9:00 AM' to '10:00 AM'). Do not schedule tasks overlapping with custom events.
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
