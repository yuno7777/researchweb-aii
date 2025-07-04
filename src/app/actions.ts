'use server';

import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";

export async function handleGenerateReport(input: GenerateReportInput): Promise<{ report: GenerateReportOutput['report'] | null; error: string | null }> {
  try {
    const { report } = await generateReport(input);
    if (!report) {
        return { report: null, error: 'Failed to generate report. The AI returned no data.' };
    }
    return { report, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { report: null, error: `An error occurred while generating the report: ${errorMessage}` };
  }
}
