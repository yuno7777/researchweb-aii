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
    introduction: z.string().describe('A compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover. This should be a substantial section.'),
    history: z.string().describe("An in-depth look at the historical background of the topic, covering its origins, key milestones, and evolution."),
    benefits: z.string().describe("A detailed explanation of the topic's benefits, supported by examples or data. Discuss the positive impacts on society, industry, or individuals."),
    challenges: z.string().describe("A thorough analysis of the problems, difficulties, and criticisms related to the topic, including ethical, technical, or social hurdles."),
    currentTrends: z.string().describe("A detailed analysis of the latest trends, recent research, and current events shaping the topic."),
    futureScope: z.string().describe("A thoughtful forecast of the topic's future, including potential innovations and long-term implications over the next decade."),
  }).describe('The structured report on the topic. The total length should be at least 1500 words.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an expert AI research assistant. Your task is to generate a comprehensive, in-depth, and well-structured report on the given topic. The total length of the report should be at least 1500 words.

For the topic "{{{topic}}}", please provide a detailed explanation for each of the following sections:

- Introduction: Provide a compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover. This should be a substantial section.
- History: Delve into the historical background of the topic. Cover its origins, key milestones, and the evolution of thought or technology related to it. Explain how past events have shaped its current state.
- Benefits: Elaborate on the advantages and benefits associated with the topic. Provide specific examples, data, or case studies to support your points. Discuss the positive impacts on society, industry, or individuals.
- Challenges: Thoroughly analyze the problems, difficulties, and criticisms related to the topic. Discuss any ethical, technical, or social hurdles. Explain the complexities and nuances of these challenges.
- Current Trends: Detail the latest trends and developments. Analyze recent research, emerging technologies, or current events that are shaping the topic. Provide a forward-looking perspective on what is happening right now.
- Future Scope: Extrapolate on the potential future implications and applications of the topic. Discuss long-term potential, possible innovations, and how it might evolve over the next decade. Provide a thoughtful and well-reasoned forecast.

Please ensure your writing is explanatory, insightful, and goes beyond surface-level descriptions. The final output must be a single, cohesive report that is at least 1500 words long.
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
