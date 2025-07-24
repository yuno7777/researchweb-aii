
'use server';

import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";

export async function handleGenerateReport(input: GenerateReportInput): Promise<{ 
  report: GenerateReportOutput['report'] | null;
  error: string | null 
}> {
  try {
    const output = await generateReport(input);

    if (!output || !output.report) {
        return { report: null, error: 'Failed to generate report. The AI returned no data.' };
    }
    
    return { 
      report: output.report, 
      error: null 
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { report: null, error: `An error occurred while generating the report: ${errorMessage}` };
  }
}


export async function handleFeedbackSubmit(feedback: string): Promise<{ success: boolean; error: string | null }> {
    if (!feedback || feedback.trim().length === 0) {
        return { success: false, error: 'Feedback cannot be empty.' };
    }

    try {
        // --- THIS IS WHERE YOU WOULD INTEGRATE AN EMAIL SERVICE ---
        // For example, using a service like Resend, Nodemailer, or SendGrid.
        // You would need to install their SDK and provide your API key via environment variables.
        //
        // Example with pseudocode:
        // import { EmailClient } from 'some-email-service';
        // const emailClient = new EmailClient(process.env.EMAIL_API_KEY);
        // await emailClient.send({
        //   from: 'feedback@insight-forge.com',
        //   to: 'your-personal-email@example.com',
        //   subject: 'New Feedback from Insight Forge',
        //   text: feedback,
        // });

        // For now, we will just log it to the server console.
        console.log('--- New Feedback Received ---');
        console.log(feedback);
        console.log('-----------------------------');

        return { success: true, error: null };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: 'Failed to submit feedback due to a server error.' };
    }
}
