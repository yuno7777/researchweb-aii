'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import Image from 'next/image';

import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
import { Header } from '@/components/Header';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ReportSkeleton } from '@/components/ReportSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Search, FileDown } from 'lucide-react';

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
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 justify-center py-5 sm:px-10 md:px-20 lg:px-40">
        <div className="flex w-full max-w-[960px] mx-auto flex-col">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight text-center pb-3 pt-6">Generate AI Research Reports</h1>
            <div className="px-4 py-3">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center gap-4">
                    <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                              <div className="flex w-full flex-1 items-stretch rounded-xl h-12 bg-input">
                                <div className="text-muted-foreground flex items-center justify-center pl-4">
                                  <Search className="h-6 w-6" />
                                </div>
                                <Input
                                  placeholder="Enter a topic"
                                  className="h-full rounded-l-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 text-base placeholder:text-muted-foreground"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex px-4 py-3 justify-center">
                      <Button type="submit" disabled={isLoading} className="h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em]">
                          {isLoading ? 'Generating...' : 'Generate'}
                      </Button>
                    </div>
                </form>
                </Form>
            </div>
            
            {isLoading && <ReportSkeleton />}

            {report && !isLoading && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6 px-4">
                  <h2 className="text-3xl font-extrabold tracking-tight capitalize">{form.getValues('topic')}</h2>
                  <Button onClick={handleExportPdf} disabled={!report} variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
                <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />
              </div>
            )}
            
            {!isLoading && !report && (
                <div className="mt-2">
                    <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Your Report Awaits</h3>
                    <div className="p-4">
                        <div className="relative bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl pt-[132px] overflow-hidden">
                            <Image src="https://placehold.co/800x400.png" data-ai-hint="technology abstract" alt="abstract placeholder" layout="fill" objectFit="cover" className="absolute top-0 left-0 w-full h-full -z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="relative flex w-full items-end justify-between gap-4 p-4">
                                <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                                    <p className="text-white tracking-light text-2xl font-bold leading-tight max-w-[440px]">Latest Report</p>
                                    <p className="text-white text-base font-medium leading-normal">Enter a topic to get started</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Search History</h3>
                        {history.length > 0 && (
                          <div className="flex px-4 py-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={handleClearHistory}
                                className="text-sm font-bold leading-normal tracking-[0.015em]"
                            >
                                Delete History
                            </Button>
                          </div>
                        )}
                        <div className="p-4">
                            {history.length === 0 ? (
                                <p className="text-muted-foreground text-base font-normal leading-normal">No search history yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {history.map((topic, index) => (
                                        <Button
                                            key={`${topic}-${index}`}
                                            variant="ghost"
                                            className="w-full justify-start text-left h-auto py-2 px-2"
                                            onClick={() => handleSelectTopic(topic)}
                                        >
                                            <span className="truncate">{topic}</span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
