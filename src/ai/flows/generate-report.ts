
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
  title: z.string().describe('A concise and engaging title for the report.'),
  reportContent: z.string().describe('A comprehensive, multi-paragraph report on the topic, approximately 600-800 words long. It should be well-structured and detailed.'),
  erd: z.string().describe("Generate an Entity Relationship Diagram in Mermaid.js syntax. The diagram must be enclosed in an 'erDiagram' block. It must only represent the key entities and their relationships based on the report content. Do not include attributes inside the entities. Example: erDiagram\\n    USER ||--o{ POST : \"creates\"\\n    POST ||--|{ COMMENT : \"has\""),
});


const ConciseReportSchema = z.object({
    summary: z.string().describe("A detailed, 300-word summary of the topic."),
    keyPoints: z.array(z.string()).describe("A list of 10-15 key takeaways or bullet points about the topic."),
});

const DeepReportSchema = z.object({
  title: z.string().describe('A concise and engaging title for the report.'),
  reportContent: z.string().describe('An in-depth, comprehensive, multi-paragraph report on the topic, approximately 1200-1500 words long. The analysis must be thorough, insightful, and well-structured.'),
  erd: z.string().describe("Generate an Entity Relationship Diagram in Mermaid.js syntax. The diagram must be enclosed in an 'erDiagram' block. It must only represent the key entities and their relationships based on the report content. Do not include attributes inside the entities. Example: erDiagram\\n    USER ||--o{ POST : \"creates\"\\n    POST ||--|{ COMMENT : \"has\""),
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

For the topic "{{{topic}}}", please provide the following:

1.  **Report Content**: A detailed, multi-paragraph report. This should cover various aspects of the topic like its history, importance, challenges, and future trends, woven together in a flowing narrative. Aim for a word count between 600 and 800 words.
2.  **ERD**: An Entity Relationship Diagram in Mermaid.js syntax based on the report's content. The diagram must be enclosed in an 'erDiagram' block. The diagram should only show relationships between entities, not attributes within entities.
`,
});

const deepResearchPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    input: { schema: GenerateReportInputSchema },
    output: { schema: DeepReportSchema },
    prompt: `You are an expert AI research analyst. Your task is to generate a highly comprehensive and in-depth report on the given topic. Your analysis must be thorough, insightful, and well-structured.

For the topic "{{{topic}}}", please provide the following:

1.  **Report Content**: A very detailed, extensive, multi-paragraph report. This should provide a deep dive into the topic, covering its nuances, history, complexities, current landscape, and future outlook. Aim for a word count between 1200 and 1500 words.
2.  **ERD**: An Entity Relationship Diagram in Mermaid.js syntax, based on the report's content. The diagram must be enclosed in an 'erDiagram' block. The diagram should only show relationships between entities, not attributes within entities.
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

