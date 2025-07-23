
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
  searchType: z.enum(['concise', 'web', 'deep']).describe('The type of search to perform.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const StandardReportSchema = z.object({
    title: z.string().describe("A concise and engaging title for the report."),
    introduction: z.string().describe("A compelling introduction that defines the topic, explains its significance, and outlines the report's scope."),
    history: z.string().describe("An in-depth exploration of the topic's historical background, including its origins, key milestones, and evolution."),
    benefits: z.string().describe("A detailed analysis of the topic's benefits, supported by examples or data, highlighting positive impacts."),
    challenges: z.string().describe("A thorough examination of the problems, difficulties, and criticisms associated with the topic."),
    currentTrends: z.string().describe("An analysis of the latest trends, recent research, and current events shaping the topic."),
    futureScope: z.string().describe("A forecast of the topic's future, discussing potential innovations and long-term implications."),
});

const ConciseReportSchema = z.object({
    summary: z.string().describe("A detailed, 300-word summary of the topic."),
    keyPoints: z.array(z.string()).describe("A list of 10-15 key takeaways or bullet points about the topic."),
});

const GenerateReportOutputSchema = z.object({
    report: z.union([StandardReportSchema, ConciseReportSchema]),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;


export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: StandardReportSchema },
  prompt: `You are an expert AI research assistant. Your task is to generate a comprehensive, in-depth, and well-structured report on the given topic. The total length of the report should be between 150 and 350 words.

For the topic "{{{topic}}}", please provide a detailed explanation for each of the following sections:

- Title: A concise and engaging title for the report.
- Introduction: Provide a compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover.
- History: Delve into the historical background of the topic. Cover its origins, key milestones, and the evolution of thought or technology related to it.
- Benefits: Elaborate on the advantages and benefits associated with the topic. Provide specific examples or data to support your points.
- Challenges: Thoroughly analyze the problems, difficulties, and criticisms related to the topic.
- Current Trends: Detail the latest trends and developments shaping the topic.
- Future Scope: Extrapolate on the potential future implications and applications of the topic.
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: StandardReportSchema },
    prompt: `You are a panel of expert AI research analysts. Your task is to generate a highly detailed, academic-style report on the given topic, ensuring the total length is at least 1200 words. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", provide an exhaustive and in-depth explanation for each of the following sections:

- Title: A concise and engaging title for the report.
- Introduction: A compelling introduction that clearly defines the topic, explains its significance, and gives a detailed overview of what the report will cover. This should be a substantial section.
- History: An in-depth look at the historical background of the topic, covering its origins, key milestones, and evolution.
- Benefits: A detailed explanation of the topic's benefits, supported by examples or data. Discuss the positive impacts on society, industry, or individuals.
- Challenges: A thorough analysis of the problems, difficulties, and criticisms related to the topic, including ethical, technical, or social hurdles.
- Current Trends: A detailed analysis of the latest trends, recent research, and current events shaping the topic.
- Future Scope: A thoughtful forecast of the topic's future, including potential innovations and long-term implications over the next decade.
`,
});

const conciseReportPrompt = ai.definePrompt({
    name: 'conciseReportPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: ConciseReportSchema },
    prompt: `You are an AI assistant specializing in creating concise yet comprehensive summaries. For the topic "{{{topic}}}", please provide the following:

1.  A detailed summary of the topic, approximately 300 words in length.
2.  A list of 10-15 key takeaways presented as bullet points.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {
    let reportOutput;
    if (input.searchType === 'web') {
        const { output } = await reportPrompt(input);
        reportOutput = output;
    } else if (input.searchType === 'deep') {
        const { output } = await deepResearchPrompt(input);
        reportOutput = output;
    } else {
        const { output } = await conciseReportPrompt(input);
        reportOutput = output;
    }
    
    if (!reportOutput) {
      throw new Error('Report generation failed.');
    }

    return { report: reportOutput };
  }
);
