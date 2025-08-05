
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
  title: z.string().describe('A concise and engaging title for the report.'),
  introduction: z.string().optional().describe('A 150-word introduction to the topic.'),
  history: z.string().optional().describe('A 200-word history of the topic.'),
  benefits: z.string().optional().describe('A 200-word overview of the benefits or advantages.'),
  challenges: z.string().optional().describe('A 200-word summary of the challenges or disadvantages.'),
  currentTrends: z.string().optional().describe('A 200-word analysis of current trends.'),
  futureScope: z.string().optional().describe('A 200-word projection of the future scope.'),
  erd: z.string().describe("A responsive, accessible entity relationship diagram represented as an HTML string. The diagram should be wrapped in a div with the class 'erd-container'. Entities should be divs with the class 'erd-entity'. Relationships should be divs with the class 'erd-relationship', containing spans for the relationship type."),
  sources: z.string().optional().describe('A list of 2-3 sources or citations, formatted as a string with each source on a new line.'),
});


const ConciseReportSchema = z.object({
    summary: z.string().describe("A detailed, 300-word summary of the topic."),
    keyPoints: z.array(z.string()).describe("A list of 10-15 key takeaways or bullet points about the topic."),
    sources: z.string().optional().describe("A list of sources or citations used for the report, formatted as a string with each source on a new line."),
});

const DeepReportSchema = z.object({
  title: z.string().describe('A concise and engaging title for the report.'),
  introduction: z.string().optional().describe('A comprehensive, 200-word introduction to the topic.'),
  history: z.string().optional().describe('An in-depth, 200-word history of the topic.'),
  benefits: z.string().optional().describe('A detailed, 200-word overview of the benefits or advantages.'),
  challenges: z.string().optional().describe('A thorough, 200-word summary of the challenges or disadvantages.'),
  currentTrends: z.string().optional().describe('An extensive, 200-word analysis of current trends.'),
  futureScope: z.string().optional().describe('A forward-looking, 200-word projection of the future scope.'),
  erd: z.string().describe("A responsive, accessible entity relationship diagram represented as an HTML string. The diagram should be wrapped in a div with the class 'erd-container'. Entities should be divs with the class 'erd-entity'. Relationships should be divs with the class 'erd-relationship', containing spans for the relationship type."),
  sources: z.string().optional().describe('A list of 5-7 sources or citations, formatted as a string with each source on a new line.'),
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
  input: {schema: z.object({
      topic: z.string(),
      generateWithReferences: z.boolean().optional(),
      sections: z.record(z.string(), z.boolean()),
  })},
  output: {schema: StandardReportSchema },
  prompt: `You are an expert AI research assistant. Your task is to generate a comprehensive, in-depth, and well-structured report on the given topic.

For the topic "{{{topic}}}", please provide a detailed explanation for each of the following sections that are provided in the 'sections' object. If a section is not in the object, you should not generate it.

- Title: A concise and engaging title for the report.

{{#if sections.Introduction}}
- Introduction: A 150-word introduction to the topic.
{{/if}}
{{#if sections.History}}
- History: A 200-word history of the topic.
{{/if}}
{{#if sections.Benefits}}
- Benefits: A 200-word overview of the benefits or advantages.
{{/if}}
{{#if sections.Challenges}}
- Challenges: A 200-word summary of the challenges or disadvantages.
{{/if}}
{{#if sections.CurrentTrends}}
- Current Trends: A 200-word analysis of current trends.
{{/if}}
{{#if sections.FutureScope}}
- Future Scope: A 200-word projection of the future scope.
{{/if}}

- ERD: You must generate an entity relationship diagram (ERD) in HTML format. Wrap it in a <div class="erd-container">. Each entity should be a <div class="erd-entity">. Each relationship should be a <div class="erd-relationship"> containing a span. This should visualize the main entities and their relationships based on the report's content.

{{#if generateWithReferences}}
- Sources: Provide a list of 2-3 web links or citations that were used to generate this report. Format them as a string, with each source on a new line.
{{/if}}
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: z.object({
        topic: z.string(),
        generateWithReferences: z.boolean().optional(),
        sections: z.record(z.string(), z.boolean()),
    }) },
    output: { schema: DeepReportSchema },
    prompt: `You are an expert AI research analyst. Your task is to generate a comprehensive and in-depth report on the given topic. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", provide a very detailed and extensive explanation for each of the following sections provided in the 'sections' object. If a section is not in the object, you should not generate it.

- Title: A concise and engaging title for the report.

{{#if sections.Introduction}}
- Introduction: A comprehensive, 200-word introduction to the topic.
{{/if}}
{{#if sections.History}}
- History: An in-depth, 200-word history of the topic.
{{/if}}
{{#if sections.Benefits}}
- Benefits: A detailed, 200-word overview of the benefits or advantages.
{{/if}}
{{#if sections.Challenges}}
- Challenges: A thorough, 200-word summary of the challenges or disadvantages.
{{/if}}
{{#if sections.CurrentTrends}}
- Current Trends: An extensive, 200-word analysis of current trends.
{{/if}}
{{#if sections.FutureScope}}
- Future Scope: A forward-looking, 200-word projection of the future scope.
{{/if}}

- ERD: You must generate an entity relationship diagram (ERD) in HTML format. Wrap it in a <div class="erd-container">. Each entity should be a <div class="erd-entity">. Each relationship should be a <div class="erd-relationship"> containing a span. This should visualize the main entities and their relationships based on the report's content.

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
    
    if (input.searchType === 'concise') {
        const { output } = await conciseReportPrompt(input);
        reportOutput = output;
    } else {
        const defaultSections = ["Introduction", "History", "Benefits", "Challenges", "Current Trends", "Future Scope"];
        const sectionsToGenerate = input.sections && input.sections.length > 0 ? input.sections : defaultSections;
            
        const sectionsAsObject = sectionsToGenerate.reduce((acc, section) => {
            acc[section] = true;
            return acc;
        }, {} as Record<string, boolean>);

        const flowInput = { 
            topic: input.topic,
            generateWithReferences: input.generateWithReferences,
            sections: sectionsAsObject,
        };

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
