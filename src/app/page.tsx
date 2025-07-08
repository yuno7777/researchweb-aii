
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { Search, FileDown, Trash2 } from 'lucide-react';

import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ReportSkeleton } from '@/components/ReportSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

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

const Logo = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8 text-[#eaadea]">
        <g clipPath="url(#clip0_6_543)">
        <path
            d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
            fill="currentColor"
        ></path>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z"
            fill="currentColor"
        ></path>
        </g>
        <defs>
        <clipPath id="clip0_6_543"><rect width="48" height="48" fill="white"></rect></clipPath>
        </defs>
    </svg>
);


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

    const capitalizeTitle = (title: string) => {
      return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const topicTitle = capitalizeTitle(form.getValues('topic'));
    const fileName = `InsightForge_Report_${topicTitle.replace(/ /g, '_') || 'Untitled'}.pdf`;
    
    toast({ title: 'Exporting PDF...', description: 'Please wait while your report is being prepared.' });

    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pageMargin = 20;
        const contentWidth = pdf.internal.pageSize.getWidth() - (pageMargin * 2);
        const pageHeight = pdf.internal.pageSize.getHeight();
        let y = pageMargin;
        let pageNum = 1;

        const addPageHeaderAndFooter = () => {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(150);
            pdf.text(`Page ${pageNum}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
            pdf.setTextColor(0);
        };

        const addPageWithHeaderFooter = () => {
            pdf.addPage();
            pageNum++;
            y = pageMargin;
            addPageHeaderAndFooter();
        };

        // --- TITLE PAGE ---
        pdf.setFillColor(248, 249, 250); // Light grey background
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(28);
        pdf.setTextColor(32, 19, 32); // Dark text color
        const titleLines = pdf.splitTextToSize(topicTitle, contentWidth - 20);
        pdf.text(titleLines, pdf.internal.pageSize.getWidth() / 2, pageHeight / 2 - 20, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(108, 117, 125); // Muted text color
        pdf.text('AI-Generated Research Report', pdf.internal.pageSize.getWidth() / 2, pageHeight / 2, { align: 'center' });
        
        pdf.setDrawColor(222, 226, 230); // Separator line color
        pdf.setLineWidth(0.5);
        pdf.line(pageMargin, pageHeight / 2 + 10, contentWidth + pageMargin, pageHeight / 2 + 10);

        pdf.setFontSize(12);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.text(`Generated by InsightForge on ${date}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });

        pdf.setTextColor(0); // Reset text color

        // --- CONTENT PAGES ---
        addPageWithHeaderFooter();

        sectionOrder.forEach(sectionKey => {
            if (report[sectionKey]) {
                const sectionContent = report[sectionKey];
                const sectionTitleText = sectionTitles[sectionKey];

                if (y + 25 > pageHeight - pageMargin) { 
                    addPageWithHeaderFooter();
                }

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.setTextColor(49, 53, 57); // Dark grey for titles
                pdf.text(sectionTitleText, pageMargin, y);
                y += 7;
                
                pdf.setDrawColor(222, 226, 230);
                pdf.setLineWidth(0.25);
                pdf.line(pageMargin, y, contentWidth + pageMargin, y);
                y += 8;

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(12);
                pdf.setTextColor(33, 37, 41); // Standard text color
                const contentLines = pdf.splitTextToSize(sectionContent, contentWidth);
                const lineHeight = 7;

                contentLines.forEach((line: string) => {
                    if (y + lineHeight > pageHeight - pageMargin) {
                        addPageWithHeaderFooter();
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(12);
                        pdf.setTextColor(33, 37, 41);
                    }
                    pdf.text(line, pageMargin, y);
                    y += lineHeight;
                });
                
                y += 10;
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
    <div className="flex min-h-screen w-full flex-col bg-[#201320] text-white">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#422942] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
              <Logo />
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">InsightForge</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8"></div>
      </header>
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
                              <div className="flex w-full flex-1 items-stretch rounded-full h-12">
                                <div className="text-[#c19ac1] flex items-center justify-center pl-4 bg-[#422942] rounded-l-full">
                                  <Search className="h-6 w-6" />
                                </div>
                                <Input
                                  placeholder="Enter a topic"
                                  className="h-full rounded-l-none rounded-r-full border-none bg-[#422942] focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 text-base placeholder:text-[#c19ac1]"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex px-4 py-3 justify-center">
                      <Button type="submit" disabled={isLoading} className="h-10 rounded-full px-4 text-sm font-bold leading-normal tracking-[0.015em] bg-[#eaadea] text-[#201320] hover:bg-[#eaadea]/90">
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
                  <Button onClick={handleExportPdf} disabled={!report} variant="secondary" className="rounded-full bg-[#422944] text-white hover:bg-[#422942]/90">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
                <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />
              </div>
            )}
            
            {!isLoading && !report && history.length > 0 && (
              <div className="mt-8">
                  <div className="flex items-center justify-between px-4 pb-2 pt-4">
                      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Search History</h3>
                      <Button
                          variant="secondary"
                          onClick={handleClearHistory}
                          className="h-10 rounded-full px-4 text-sm font-bold leading-normal tracking-[0.015em] bg-[#422942] text-white hover:bg-[#422942]/90"
                      >
                           <Trash2 className="mr-2 h-4 w-4" />
                          Delete History
                      </Button>
                  </div>
                  <div className="p-4">
                      <div className="flex flex-col gap-2">
                          {history.map((topic, index) => (
                              <Button
                                  key={`${topic}-${index}`}
                                  variant="ghost"
                                  className="w-full rounded-full justify-start text-left h-auto py-2 px-2 text-white hover:bg-[#422942]"
                                  onClick={() => handleSelectTopic(topic)}
                              >
                                  <span className="truncate">{topic}</span>
                              </Button>
                          ))}
                      </div>
                  </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
