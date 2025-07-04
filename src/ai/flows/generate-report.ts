// src/ai/flows/generate-report.ts
'use server';
/**
 * @fileOverview AI-powered report generation flow.
 *
 * - generateReport - A function that generates a structured report on a user-defined topic.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  topic: z.string().describe('The topic to generate a report on.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.object({
    introduction: z.string().describe('An introduction to the topic.'),
    history: z.string().describe('The history of the topic.'),
    benefits: z.string().describe('The benefits of the topic.'),
    challenges: z.string().describe('The challenges of the topic.'),
    currentTrends: z.string().describe('The current trends of the topic.'),
    futureScope: z.string().describe('The future scope of the topic.'),
  }).describe('The structured report on the topic.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an AI research assistant. Your task is to generate a structured report on the given topic.
  The report should include the following sections:

  - Introduction: An overview of the topic.
  - History: The historical background of the topic.
  - Benefits: The advantages and benefits associated with the topic.
  - Challenges: The problems and difficulties related to the topic.
  - Current Trends: The latest trends and developments in the topic.
  - Future Scope: The potential future implications and applications of the topic.

  Topic: {{{topic}}}

  Please provide a well-structured and informative report.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await reportPrompt(input);
    return output!;
  }
);
