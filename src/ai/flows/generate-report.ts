
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

const ReportSectionSchema = z.object({
    introduction: z.string().describe("A brief introduction to the topic."),
    history: z.string().describe("A summary of the history and evolution of the topic."),
    benefits: z.string().describe("A discussion of the key benefits and advantages related to the topic."),
    challenges: z.string().describe("An overview of the challenges, risks, and disadvantages associated with the topic."),
    currentTrends: z.string().describe("An analysis of the current trends and state-of-the-art in this area."),
    futureScope: z.string().describe("A look into the future scope and potential developments."),
});


const StandardReportSchema = z.object({
  title: z.string().describe('A concise and engaging title for the report.'),
  sections: ReportSectionSchema.describe("The structured content of the report, broken down into predefined sections."),
  erd: z.string().describe("Generate an Entity Relationship Diagram in Mermaid.js syntax. The diagram must be enclosed in an 'erDiagram' block. It must only represent the key entities and their relationships based on the report content. Do not include attributes inside the entities. Example: erDiagram\\n    USER ||--o{ POST : \\\"creates\\\"\\n    POST ||--|{ COMMENT : \\\"has\\\""),
});


const ConciseReportSchema = z.object({
    summary: z.string().describe("A detailed, 300-word summary of the topic."),
    keyPoints: z.array(z.string()).describe("A list of 10-15 key takeaways or bullet points about the topic."),
});

const DeepReportSchema = z.object({
  title: z.string().describe('A concise and engaging title for the report.'),
  sections: ReportSectionSchema.describe("An in-depth and thorough breakdown of the report content into predefined sections."),
  erd: z.string().describe("Generate an Entity Relationship Diagram in Mermaid.js syntax. The diagram must be enclosed in an 'erDiagram' block. It must only represent the key entities and their relationships based on the report content. Do not include attributes inside the entities. Example: erDiagram\\n    USER ||--o{ POST : \\\"creates\\\"\\n    POST ||--|{ COMMENT : \\\"has\\\""),
});


const GenerateReportOutputSchema = z.union([StandardReportSchema, ConciseReportSchema, DeepReportSchema]);
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;


export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: GenerateReportInputSchema },
  output: {schema: StandardReportSchema },
  prompt: `You are an expert AI research assistant. Your task is to generate a comprehensive, well-structured report on the given topic.

For the topic "{{{topic}}}", please generate content for the following sections:
- Introduction
- History
- Benefits
- Challenges
- Current Trends
- Future Scope

Also provide the following:
1.  **ERD**: An Entity Relationship Diagram in Mermaid.js syntax based on the report's content. The diagram must be enclosed in an 'erDiagram' block. The diagram should only show relationships between entities, not attributes within entities.
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: DeepReportSchema },
    prompt: `You are an expert AI research analyst. Your task is to generate a highly comprehensive and in-depth report on the given topic. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", please generate in-depth content for the following sections. Ensure each section is detailed and comprehensive, aiming for approximately 250-300 words per section to create a thorough report of around 1500-1800 words in total.
- Introduction
- History
- Benefits
- Challenges
- Current Trends
- Future Scope

Also provide the following:
1.  **ERD**: An Entity Relationship Diagram in Mermaid.js syntax, based on the report's content. The diagram must be enclosed in an 'erDiagram' block. The diagram should only show relationships between entities, not attributes within entities.
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
    
    if (input.searchType === 'concise') {
        const { output } = await conciseReportPrompt(input);
        reportOutput = output;
    } else if (input.searchType === 'web') {
        const { output } = await reportPrompt(input);
        reportOutput = output;
    } else if (input.searchType === 'deep') {
        const { output } = await deepResearchPrompt(input);
        reportOutput = output;
    }
    
    if (!reportOutput) {
      throw new Error('Report generation failed.');
    }

    return reportOutput;
  }
);
