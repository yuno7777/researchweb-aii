'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';

import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ReportSkeleton } from '@/components/ReportSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic must be at most 100 characters long." }),
});

type ReportData = GenerateReportOutput['report'];

const sectionOrder: (keyof ReportData)[] = [
  'introduction',
  'history',
  'benefits',
  'challenges',
  'currentTrends',
  'futureScope',
];

const sectionTitles: Record<keyof ReportData, string> = {
  introduction: 'Introduction',
  history: 'History',
  benefits: 'Benefits',
  challenges: 'Challenges',
  currentTrends: 'Current Trends',
  futureScope: 'Future Scope',
};

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>('report-history', []);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setReport(null);
    form.clearErrors();

    const result = await handleGenerateReport({ topic: values.topic });

    if (result.error || !result.report) {
      toast({
        variant: "destructive",
        title: "Error Generating Report",
        description: result.error || "An unknown error occurred.",
      });
    } else {
      setReport(result.report);
      if (!history.includes(values.topic)) {
        setHistory([values.topic, ...history]);
      }
    }
    setIsLoading(false);
  };

  const handleSelectTopic = (topic: string) => {
    form.setValue('topic', topic);
    onSubmit({ topic });
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    toast({ title: "History cleared." });
  }
  
  const handleReportUpdate = (updatedReport: ReportData) => {
    setReport(updatedReport);
    toast({ title: "Report updated.", description: "Your changes have been saved locally." });
  }

  const handleExportPdf = () => {
    if (!report) {
        toast({ variant: 'destructive', title: 'Error', description: 'No report data available to export.' });
        return;
    }

    const topicTitle = form.getValues('topic');
    const fileName = `InsightForge_Report_${topicTitle.replace(/ /g, '_') || 'Untitled'}.pdf`;
    
    toast({ title: 'Exporting PDF...', description: 'Please wait while your report is being prepared.' });

    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pageMargin = 15;
        const pageWidth = pdf.internal.pageSize.getWidth() - (pageMargin * 2);
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = pageMargin;

        const checkPageBreak = (spaceNeeded: number) => {
            if (yPosition + spaceNeeded > pageHeight - pageMargin) {
                pdf.addPage();
                yPosition = pageMargin;
            }
        };

        // Add Topic Title
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        const topicLines = pdf.splitTextToSize(topicTitle, pageWidth);
        checkPageBreak(topicLines.length * 10);
        pdf.text(topicLines, pageMargin, yPosition);
        yPosition += (topicLines.length * 8) + 10;
        
        pdf.setFont('helvetica', 'normal');

        sectionOrder.forEach(sectionKey => {
            if (report[sectionKey]) {
                checkPageBreak(20); // check for space before adding new section

                // Section Title
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                const sectionTitleText = sectionTitles[sectionKey];
                const titleLines = pdf.splitTextToSize(sectionTitleText, pageWidth);
                pdf.text(titleLines, pageMargin, yPosition);
                yPosition += (titleLines.length * 7) + 5;
                
                // Section Content
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                const contentLines = pdf.splitTextToSize(report[sectionKey], pageWidth);

                contentLines.forEach((line: string) => {
                    checkPageBreak(5);
                    pdf.text(line, pageMargin, yPosition);
                    yPosition += 5; // line height
                });
                
                yPosition += 10; // space after section
            }
        });

        pdf.save(fileName);
        toast({ title: 'Export complete!', description: `${fileName} has been downloaded.`});
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast({ variant: 'destructive', title: 'PDF Export Failed', description: errorMessage });
        console.error("PDF Export Error:", err);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onExport={handleExportPdf} isReportReady={!!report} />
      <div className="flex flex-1">
        <aside className="hidden md:block w-64 lg:w-72">
          <HistorySidebar history={history} onSelectTopic={handleSelectTopic} onClearHistory={handleClearHistory} />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Generate a New Report</CardTitle>
                <CardDescription>Enter a topic below and let our AI assistant craft a detailed report for you.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input placeholder="e.g., The future of renewable energy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto flex-shrink-0">
                      {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div>
              {isLoading && <ReportSkeleton />}
              {report && <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />}
              {!isLoading && !report && (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Your Report Awaits</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter a topic above to generate your first report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
