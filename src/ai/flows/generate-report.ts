
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

const sectionsSchema = z.enum([
    "introduction",
    "history",
    "benefits",
    "challenges",
    "currentTrends",
    "futureScope"
]);

const GenerateReportInputSchema = z.object({
  topic: z.string().describe('The topic to generate a report on.'),
  searchType: z.enum(['concise', 'web', 'deep']).describe('The type of search to perform.'),
  generateWithReferences: z.boolean().optional().describe('Whether to include a list of sources.'),
  sections: z.array(sectionsSchema).optional().describe('A list of sections to include in the report.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const StandardReportSchema = z.object({
    title: z.string().describe("A concise and engaging title for the report."),
    introduction: z.string().optional().describe("A compelling introduction that defines the topic, explains its significance, and outlines the report's scope."),
    history: z.string().optional().describe("An in-depth exploration of the topic's historical background, including its origins, key milestones, and evolution."),
    benefits: z.string().optional().describe("A detailed analysis of the topic's benefits, supported by examples or data, highlighting positive impacts."),
    challenges: z.string().optional().describe("A thorough examination of the problems, difficulties, and criticisms associated with the topic."),
    currentTrends: z.string().optional().describe("An analysis of the latest trends, recent research, and current events shaping the topic."),
    futureScope: z.string().optional().describe("A forecast of the topic's future, discussing potential innovations and long-term implications."),
    sources: z.string().optional().describe("A list of sources or citations used for the report, formatted as a string with each source on a new line."),
});

const ConciseReportSchema = z.object({
    summary: z.string().describe("A detailed, 300-word summary of the topic."),
    keyPoints: z.array(z.string()).describe("A list of 10-15 key takeaways or bullet points about the topic."),
    sources: z.string().optional().describe("A list of sources or citations used for the report, formatted as a string with each source on a new line."),
});

const DeepReportSchema = z.object({
    title: z.string().describe("A concise and engaging title for the report."),
    report: z.string().describe("A comprehensive and in-depth report. It should be well-structured with clear paragraphs and headings for different sections like Introduction, History, Benefits, etc."),
    sources: z.string().optional().describe("A list of sources or citations used for the report, formatted as a string with each source on a new line."),
});


const GenerateReportOutputSchema = z.object({
    report: z.union([StandardReportSchema, ConciseReportSchema, DeepReportSchema]),
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

{{#if (includes sections "introduction")}}
- Introduction: Provide a compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover.
{{/if}}
{{#if (includes sections "history")}}
- History: Delve into the historical background of the topic. Cover its origins, key milestones, and the evolution of thought or technology related to it.
{{/if}}
{{#if (includes sections "benefits")}}
- Benefits: Elaborate on the advantages and benefits associated with the topic. Provide specific examples or data to support your points.
{{/if}}
{{#if (includes sections "challenges")}}
- Challenges: Thoroughly analyze the problems, difficulties, and criticisms related to the topic.
{{/if}}
{{#if (includes sections "currentTrends")}}
- Current Trends: Detail the latest trends and developments shaping the topic.
{{/if}}
{{#if (includes sections "futureScope")}}
- Future Scope: Extrapolate on the potential future implications and applications of the topic.
{{/if}}

{{#if generateWithReferences}}
- Sources: Provide a list of 2-3 web links or citations that were used to generate this report. Format them as a string, with each source on a new line.
{{/if}}
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: StandardReportSchema },
    prompt: `You are an expert AI research analyst. Your task is to generate a comprehensive and in-depth report on the given topic of approximately 1600 words. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", provide a very detailed and extensive explanation for each of the following sections, ensuring the total word count is around 1600 words:

- Title: A concise and engaging title for the report.

{{#if (includes sections "introduction")}}
- Introduction: Provide a compelling introduction that clearly defines the topic, explains its significance, and gives a brief overview of what the report will cover.
{{/if}}
{{#if (includes sections "history")}}
- History: Delve into the historical background of the topic. Cover its origins, key milestones, and the evolution of thought or technology related to it.
{{/if}}
{{#if (includes sections "benefits")}}
- Benefits: Elaborate on the advantages and benefits associated with the topic. Provide specific examples or data to support your points.
{{/if}}
{{#if (includes sections "challenges")}}
- Challenges: Thoroughly analyze the problems, difficulties, and criticisms related to the topic.
{{/if}}
{{#if (includes sections "currentTrends")}}
- Current Trends: Detail the latest trends and developments shaping the topic.
{{/if}}
{{#if (includes sections "futureScope")}}
- Future Scope: Extrapolate on the potential future implications and applications of the topic.
{{/if}}

{{#if generateWithReferences}}
- Sources: Provide a list of 5-7 web links or citations that were used to generate this report. Format them as a string, with each source on a new line.
{{/if}}
`,
});

const conciseReportPrompt = ai.definePrompt({
    name: 'conciseReportPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: ConciseReportSchema },
    prompt: `You are an AI assistant specializing in creating concise yet comprehensive summaries. For the topic "{{{topic}}}", please provide the following:

1.  A detailed summary of the topic, approximately 300 words in length.
2.  A list of 10-15 key takeaways presented as bullet points.

{{#if generateWithReferences}}
3.  A list of 2-3 web links or citations that were used to generate this summary. Format them as a string, with each source on a new line.
{{/if}}
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
    
    // Default sections for web and deep search if not provided
    const sectionsToGenerate = input.sections && input.sections.length > 0
        ? input.sections
        : ["introduction", "history", "benefits", "challenges", "currentTrends", "futureScope"];
        
    const flowInput = { ...input, sections: sectionsToGenerate };

    if (input.searchType === 'web') {
        const { output } = await reportPrompt(flowInput);
        reportOutput = output;
    } else if (input.searchType === 'deep') {
        const { output } = await deepResearchPrompt(flowInput);
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
