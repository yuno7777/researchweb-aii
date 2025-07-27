
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

const sectionsSchema = z.string();

const GenerateReportInputSchema = z.object({
  topic: z.string().describe('The topic to generate a report on.'),
  searchType: z.enum(['concise', 'web', 'deep']).describe('The type of search to perform.'),
  generateWithReferences: z.boolean().optional().describe('Whether to include a list of sources.'),
  sections: z.array(sectionsSchema).optional().describe('A list of sections to include in the report.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const StandardReportSchema = z.object({
    title: z.string().describe("A concise and engaging title for the report."),
    report: z.string().describe("A comprehensive and well-structured report based on the user's selected sections."),
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
  prompt: `You are an expert AI research assistant. Your task is to generate a comprehensive, in-depth, and well-structured report on the given topic. The total length of the report should be between 150 and 350 words per section.

For the topic "{{{topic}}}", please provide a detailed explanation for each of the following sections provided.

- Title: A concise and engaging title for the report.
- Report: Generate a comprehensive report. For each of the section titles provided in the 'sections' array, generate a detailed section with a proper heading.

{{#each sections}}
### {{this}}
{{/each}}

{{#if generateWithReferences}}
### Sources
Provide a list of 2-3 web links or citations that were used to generate this report. Format them as a string, with each source on a new line.
{{/if}}
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: DeepReportSchema },
    prompt: `You are an expert AI research analyst. Your task is to generate a comprehensive and in-depth report on the given topic of approximately 1600 words. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", provide a very detailed and extensive explanation for each of the following sections provided.

- Title: A concise and engaging title for the report.
- Report: Generate a comprehensive report. For each of the section titles provided in the 'sections' array, generate a detailed section with a proper heading.

{{#each sections}}
### {{this}}
{{/each}}

{{#if generateWithReferences}}
### Sources
Provide a list of 5-7 web links or citations that were used to generate this report. Format them as a string, with each source on a new line.
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
    
    if (input.searchType === 'concise') {
        const { output } = await conciseReportPrompt(input);
        reportOutput = output;
    } else {
        const defaultSections = ["Introduction", "History", "Benefits", "Challenges", "Current Trends", "Future Scope"];
        const sectionsToGenerate = input.sections && input.sections.length > 0 ? input.sections : defaultSections;
            
        const flowInput = { ...input, sections: sectionsToGenerate };

        if (input.searchType === 'web') {
            const { output } = await reportPrompt(flowInput);
            reportOutput = output;
        } else if (input.searchType === 'deep') {
            const { output } = await deepResearchPrompt(flowInput);
            reportOutput = output;
        }
    }
    
    if (!reportOutput) {
      throw new Error('Report generation failed.');
    }

    return { report: reportOutput };
  }
);
