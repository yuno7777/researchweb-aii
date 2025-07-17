
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { ArrowUp, Trash2 } from 'lucide-react';

import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ReportSkeleton } from '@/components/ReportSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic must be at most 100 characters long." }),
});

type ReportData = GenerateReportOutput['report'];

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>('report-history', []);
  const [searchType, setSearchType] = useState<'web' | 'deep'>('web');
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
        pdf.setFillColor(248, 249, 250); 
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(28);
        pdf.setTextColor(32, 19, 32); 
        const titleLines = pdf.splitTextToSize(topicTitle, contentWidth - 20);
        pdf.text(titleLines, pdf.internal.pageSize.getWidth() / 2, pageHeight / 2 - 20, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(108, 117, 125);
        pdf.text('AI-Generated Research Report', pdf.internal.pageSize.getWidth() / 2, pageHeight / 2, { align: 'center' });
        
        pdf.setDrawColor(222, 226, 230);
        pdf.setLineWidth(0.5);
        pdf.line(pageMargin, pageHeight / 2 + 10, contentWidth + pageMargin, pageHeight / 2 + 10);

        pdf.setFontSize(12);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.text(`Generated by InsightForge on ${date}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });

        pdf.setTextColor(0);

        // --- CONTENT PAGES ---
        addPageWithHeaderFooter();

        const sectionOrder: (keyof ReportData)[] = ['introduction', 'history', 'benefits', 'challenges', 'currentTrends', 'futureScope'];
        const sectionTitles: Record<keyof ReportData, string> = {
          introduction: 'Introduction',
          history: 'History',
          benefits: 'Benefits',
          challenges: 'Challenges',
          currentTrends: 'Current Trends',
          futureScope: 'Future Scope',
        };

        sectionOrder.forEach(sectionKey => {
            if (report[sectionKey]) {
                const sectionContent = report[sectionKey];
                const sectionTitleText = sectionTitles[sectionKey];
                
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.setTextColor(49, 53, 57);

                if (y + 25 > pageHeight - pageMargin) { 
                    addPageWithHeaderFooter();
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    pdf.setTextColor(49, 53, 57);
                }

                pdf.text(sectionTitleText, pageMargin, y);
                y += 7;
                
                pdf.setDrawColor(222, 226, 230);
                pdf.setLineWidth(0.25);
                pdf.line(pageMargin, y, contentWidth + pageMargin, y);
                y += 8;
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(12);
                pdf.setTextColor(33, 37, 41);
                const contentLines = pdf.splitTextToSize(sectionContent, contentWidth);
                const lineHeight = 8; // Increased line height

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

  const navLinks = ["Features", "How It Works", "Reports", "Pricing", "FAQ"];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[hsl(var(--background))] text-foreground" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full bg-[hsl(var(--background))]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <h1 className="font-serif text-3xl font-bold text-primary">InsightForge</h1>
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                {navLinks.map(link => <a key={link} href="#" className="hover:text-primary transition-colors">{link}</a>)}
            </nav>
            <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">Get Started</Button>
        </div>
        <Separator />
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6">
            <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="absolute -inset-40 bg-gradient-to-br from-purple-200 via-transparent to-lime-200 opacity-30 blur-3xl" />
                      <h1 className="font-serif text-[30rem] font-bold text-gray-200/50 leading-none">InsightForge</h1>
                  </div>
              </div>

              <div className="w-full max-w-2xl space-y-4">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                              control={form.control}
                              name="topic"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormControl>
                                          <div className="relative">
                                              <Input
                                                  placeholder="Enter a topic to generate a report"
                                                  className="h-16 w-full rounded-2xl border-gray-200 bg-white/80 py-4 pl-6 pr-16 text-lg shadow-lg backdrop-blur-sm focus-visible:ring-primary"
                                                  {...field}
                                              />
                                              <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-gray-900 text-white hover:bg-gray-800" disabled={isLoading}>
                                                  <ArrowUp className="h-5 w-5"/>
                                              </Button>
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <div className="flex items-center justify-center gap-4">
                              <Button type="button" variant="ghost" onClick={() => setSearchType('web')} className={cn("rounded-full", searchType === 'web' && "bg-gray-200")}>Web Search</Button>
                              <Button type="button" variant="ghost" onClick={() => setSearchType('deep')} className={cn("rounded-full", searchType === 'deep' && "bg-gray-200")}>Deep Search</Button>
                          </div>
                      </form>
                  </Form>
              </div>

              <div className="mt-12 text-center max-w-3xl">
                <h2 className="text-xl font-bold">InsightForge: AI For Researchers, AI Report Generator</h2>
                <p className="text-muted-foreground mt-2">
                  InsightForge leverages cutting-edge AI models, including OpenAI 4o-mini, GPT-4o, and Gemini, to power its deep research agent and AI report generator, delivering accurate reports and actionable insights for researchers.
                </p>
              </div>
            </div>

            {isLoading && <div className="py-12"><ReportSkeleton /></div>}

            {report && !isLoading && (
              <div className="py-12 max-w-4xl mx-auto">
                <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />
              </div>
            )}
            
            {!isLoading && !report && history.length > 0 && (
              <div className="py-12 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-4">
                      <h3 className="text-xl font-bold">Search History</h3>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearHistory}
                          className="rounded-full"
                      >
                           <Trash2 className="mr-2 h-4 w-4" />
                          Delete History
                      </Button>
                  </div>
                  <div className="border rounded-lg">
                      <div className="flex flex-col">
                          {history.map((topic, index) => (
                              <button
                                  key={`${topic}-${index}`}
                                  className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                                  onClick={() => handleSelectTopic(topic)}
                              >
                                  <span className="truncate">{topic}</span>
                              </button>
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
