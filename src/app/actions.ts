'use server';

import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";

export async function handleGenerateReport(input: GenerateReportInput): Promise<{ 
  report: GenerateReportOutput['report'] | null; 
  conciseReport: GenerateReportOutput['conciseReport'] | null;
  searchType: GenerateReportOutput['searchType'] | null;
  error: string | null 
}> {
  try {
    const result = await generateReport(input);

    if (!result) {
        return { report: null, conciseReport: null, searchType: null, error: 'Failed to generate report. The AI returned no data.' };
    }
    
    return { 
      report: result.report || null, 
      conciseReport: result.conciseReport || null,
      searchType: result.searchType,
      error: null 
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { report: null, conciseReport: null, searchType: null, error: `An error occurred while generating the report: ${errorMessage}` };
  }
}
