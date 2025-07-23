
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
  searchType: z.enum(['web', 'deep', 'concise']).describe('The type of search to perform.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const StandardReportSchema = z.object({
  introduction: z.string().describe('A compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover. This should be a substantial section.'),
  history: z.string().describe("An in-depth look at the historical background of the topic, covering its origins, key milestones, and evolution."),
  benefits: z.string().describe("A detailed explanation of the topic's benefits, supported by examples or data. Discuss the positive impacts on society, industry, or individuals."),
  challenges: z.string().describe("A thorough analysis of the problems, difficulties, and criticisms related to the topic, including ethical, technical, or social hurdles."),
  currentTrends: z.string().describe("A detailed analysis of the latest trends, recent research, and current events shaping the topic."),
  futureScope: z.string().describe("A thoughtful forecast of the topic's future, including potential innovations and long-term implications over the next decade."),
});

const ConciseReportSchema = z.object({
    summary: z.string().describe("A concise, fact-based summary of the topic, directly answering the user's query. It should be no more than 3 paragraphs."),
    keyPoints: z.array(z.string()).describe("A bulleted list of 3-5 key facts or talking points about the topic."),
});

const GenerateReportOutputSchema = z.object({
    report: StandardReportSchema.optional(),
    conciseReport: ConciseReportSchema.optional(),
    searchType: z.enum(['web', 'deep', 'concise']),
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

- Introduction: Provide a compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover. This should be a substantial section.
- History: Delve into the historical background of the topic. Cover its origins, key milestones, and the evolution of thought or technology related to it. Explain how past events have shaped its current state.
- Benefits: Elaborate on the advantages and benefits associated with the topic. Provide specific examples, data, or case studies to support your points. Discuss the positive impacts on society, industry, or individuals.
- Challenges: Thoroughly analyze the problems, difficulties, and criticisms related to the topic. Discuss any ethical, technical, or social hurdles. Explain the complexities and nuances of these challenges.
- Current Trends: Detail the latest trends and developments. Analyze recent research, emerging technologies, or current events that are shaping the topic. Provide a forward-looking perspective on what is happening right now.
- Future Scope: Extrapolate on the potential future implications and applications of the topic. Discuss long-term potential, possible innovations, and how it might evolve over the next decade. Provide a thoughtful and well-reasonsed forecast.

Please ensure your writing is explanatory, insightful, and goes beyond surface-level descriptions. The final output must be a single, cohesive report that is between 150 and 350 words long.
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: {schema: GenerateReportInputSchema},
    output: {schema: StandardReportSchema},
    prompt: `You are a panel of three expert AI research analysts. Your task is to conduct a deep, iterative investigation into the given topic and produce a highly detailed, analytical, and insightful report. The report must be at least 1200 words.

Your response should be titled "Deep Research Report: {{{topic}}}".

For the topic "{{{topic}}}", perform a multi-faceted analysis and generate the following sections:

- Introduction: Provide a masterful introduction that frames the topic within a broader context, articulates its critical importance, and outlines the sophisticated analytical approach your panel will undertake.
- Historical Context & Evolution: Go beyond a simple timeline. Analyze the key inflection points, paradigm shifts, and influential figures that have shaped the topic. Discuss the "why" behind the historical events.
- Core Benefits & Societal Impact: Instead of a simple list, provide a nuanced analysis of the primary and secondary benefits. Use data-driven arguments and case studies to illustrate the large-scale impact on society, economies, and ecosystems.
- Critical Challenges & Nuanced Risks: Do not just list challenges. Analyze the root causes of these challenges, including systemic issues, ethical dilemmas, and unforeseen consequences. Evaluate the complex interplay between different risks.
- Current Landscape & Emerging Trends: Synthesize the most current information, including cutting-edge research, market dynamics, and competitive landscapes. Identify not just the trends, but the drivers behind them and their potential longevity.
- Future Trajectory & Strategic Outlook: Provide a sophisticated forecast. Instead of predictions, offer a scenario analysis of potential futures (e.g., optimistic, pessimistic, most likely). Discuss strategic implications for stakeholders over the next 5-10 years.

Your panel must ensure the final report is not just descriptive but deeply analytical, connecting disparate pieces of information to form a cohesive and insightful narrative.
`,
});

const concisePrompt = ai.definePrompt({
    name: 'concisePrompt',
    input: {schema: GenerateReportInputSchema},
    output: {schema: ConciseReportSchema },
    prompt: `You are a factual AI assistant. Your task is to provide a concise and direct answer to the user's query about "{{{topic}}}".

The response should be structured as follows:
1.  A brief summary, no more than 3 paragraphs long, that gets straight to the point.
2.  A bulleted list of 3-5 key, verifiable facts or talking points.

Do not include any introductory or concluding pleasantries. Focus solely on delivering the information requested.`,
});


const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input): Promise<GenerateReportOutput> => {
    switch (input.searchType) {
        case 'concise': {
            const { output } = await concisePrompt(input);
            if (!output) throw new Error("Concise report generation failed.");
            return { conciseReport: output, searchType: 'concise' };
        }
        case 'deep': {
            const { output } = await deepResearchPrompt(input);
            if (!output) throw new Error("Deep research report generation failed.");
            return { report: output, searchType: 'deep' };
        }
        case 'web':
        default: {
            const { output } = await reportPrompt(input);
            if (!output) throw new Error("Web report generation failed.");
            return { report: output, searchType: 'web' };
        }
    }
  }
);
