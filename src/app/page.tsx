
'use client';

import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { ArrowUp, Menu, Trash2, FileText, List, FileDown, BrainCircuit } from 'lucide-react';

import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ReportSkeleton } from '@/components/ReportSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientText } from '@/components/GradientText';
import { HomePageContent } from '@/components/HomePageContent';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic must be at most 100 characters long." }),
});

type ReportData = GenerateReportOutput['report'];
type ConciseReportData = GenerateReportOutput['conciseReport'];

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [conciseReport, setConciseReport] = useState<ConciseReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>('report-history', []);
  const [searchType, setSearchType] = useState<'web' | 'deep' | 'concise'>('web');
  const { toast } = useToast();
  
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
    if (!report && !conciseReport) {
      toast({ variant: 'destructive', title: 'Error', description: 'No report data available to export.' });
      return;
    }

    const capitalizeTitle = (title: string) => {
      if (!title) return '';
      return title.replace(/\b\w/g, char => char.toUpperCase());
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
        pdf.text(`AI-Generated Research Report`, pdf.internal.pageSize.getWidth() / 2, pageHeight / 2, { align: 'center' });
        
        pdf.setDrawColor(222, 226, 230);
        pdf.setLineWidth(0.5);
        pdf.line(pageMargin, pageHeight / 2 + 10, contentWidth + pageMargin, pageHeight / 2 + 10);

        pdf.setFontSize(12);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.text(`Generated by InsightForge on ${date}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });

        pdf.setTextColor(0);

        // --- CONTENT PAGES ---
        addPageWithHeaderFooter();
        
        const addSection = (title: string, content: string | string[]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.setTextColor(49, 53, 57);

            if (y + 25 > pageHeight - pageMargin) { 
                addPageWithHeaderFooter();
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.setTextColor(49, 53, 57);
            }
            
            pdf.text(title, pageMargin, y);
            y += 7;
            
            pdf.setDrawColor(222, 226, 230);
            pdf.setLineWidth(0.25);
            pdf.line(pageMargin, y, contentWidth + pageMargin, y);
            y += 8;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 37, 41);
            
            const lineHeight = 8;
            
            if (Array.isArray(content)) {
                content.forEach(line => {
                    const bulletPoint = `• ${line}`;
                    const contentLines = pdf.splitTextToSize(bulletPoint, contentWidth - 5);
                    contentLines.forEach((splitLine: string) => {
                         if (y + lineHeight > pageHeight - pageMargin) {
                            addPageWithHeaderFooter();
                             pdf.setFont('helvetica', 'normal');
                             pdf.setFontSize(12);
                             pdf.setTextColor(33, 37, 41);
                        }
                        pdf.text(splitLine, pageMargin + 5, y);
                        y += lineHeight;
                    });
                });
            } else {
                const contentLines = pdf.splitTextToSize(content, contentWidth);
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
            }
            y += 10;
        };


        if (report) {
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
                    addSection(sectionTitles[sectionKey], report[sectionKey]);
                }
            });
        } else if (conciseReport) {
            addSection('Summary', conciseReport.summary);
            addSection('Key Points', conciseReport.keyPoints);
        }

        pdf.save(fileName);
        toast({ title: 'Export complete!', description: `${fileName} has been downloaded.`});
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast({ variant: 'destructive', title: 'PDF Export Failed', description: errorMessage });
        console.error("PDF Export Error:", err);
    }
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Reports", href: "#reports" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setReport(null);
    setConciseReport(null);
    form.clearErrors();

    const result = await handleGenerateReport({ topic: values.topic, searchType });

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error Generating Report",
        description: result.error,
      });
    } else {
        if (result.report) {
            setReport(result.report);
        }
        if (result.conciseReport) {
            setConciseReport(result.conciseReport);
        }
      if (!history.includes(values.topic)) {
        setHistory([values.topic, ...history]);
      }
    }
    setIsLoading(false);
  };


  return (
    <div id="home" className="flex min-h-screen w-full flex-col bg-background text-foreground" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <a href="#home">
              <h1 className="font-sans text-xl font-semibold tracking-wider text-primary">InsightForge</h1>
            </a>
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                {navLinks.map(link => <a key={link.name} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">{link.name}</a>)}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button className="rounded-full">Get Started</Button>
            </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 md:px-6">
            <div className="relative flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
              <div
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/20 via-green-100/20 to-lime-200/20 dark:from-purple-900/20 dark:via-green-900/20 dark:to-lime-900/20"
              />
              <div className="max-w-3xl space-y-4">
                  <h2 className="font-sans text-3xl font-bold tracking-tight md:text-5xl">
                    <GradientText>Generate In-depth Reports with AI</GradientText>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    InsightForge leverages cutting-edge AI to create comprehensive, well-structured research reports on any topic in seconds.
                  </p>
              </div>

              <div className="mt-8 w-full max-w-2xl space-y-4">
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
                                                  placeholder="e.g., 'The Future of Renewable Energy'"
                                                  className="h-14 w-full rounded-full border-gray-200 bg-background py-4 pl-6 pr-16 text-lg shadow-sm focus-visible:ring-primary"
                                                  {...field}
                                              />
                                              <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10" disabled={isLoading}>
                                                  <ArrowUp className="h-5 w-5"/>
                                              </Button>
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <div className="flex items-center justify-center gap-4 text-sm">
                            <TooltipProvider>
                              <Button type="button" variant={searchType === 'web' ? 'secondary' : 'ghost'} onClick={() => setSearchType('web')} className="rounded-full">Web Search</Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button type="button" variant={searchType === 'deep' ? 'secondary' : 'ghost'} onClick={() => setSearchType('deep')} className="rounded-full">
                                    <BrainCircuit className="mr-2 h-4 w-4" />
                                    Deep Research
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Enable Deep Research for extensive academic-style analysis (1200+ words)</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button type="button" variant={searchType === 'concise' ? 'secondary' : 'ghost'} onClick={() => setSearchType('concise')} className="rounded-full">
                                    <Menu className="mr-2 h-4 w-4" />
                                    Concise Response
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Concise search mode: Provides concise, fact-focused responses using internet sources</p>
                                </TooltipContent>
                              </Tooltip>
                              </TooltipProvider>
                          </div>
                      </form>
                  </Form>
              </div>
            </div>
            
            <div id="report-output">
              {isLoading && <div className="py-12"><ReportSkeleton /></div>}

              {report && !isLoading && (
                <div className="py-12 max-w-4xl mx-auto">
                  <ReportDisplay report={report} onReportUpdate={handleReportUpdate} onExportPdf={handleExportPdf} />
                </div>
              )}

              {conciseReport && !isLoading && (
                  <div className="py-12 max-w-4xl mx-auto">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                  <FileText />
                                  Concise Report
                              </CardTitle>
                              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Export as PDF
                              </Button>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              <div>
                                  <h3 className="font-semibold mb-2">Summary</h3>
                                  <p className="text-muted-foreground whitespace-pre-wrap">{conciseReport.summary}</p>
                              </div>
                              <div>
                                  <h3 className="font-semibold mb-2">Key Points</h3>
                                  <ul className="space-y-2">
                                      {conciseReport.keyPoints.map((point, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                              <List className="h-4 w-4 mt-1 text-primary"/>
                                              <span className="text-muted-foreground">{point}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              )}
              
              {!isLoading && !report && !conciseReport && history.length > 0 && (
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
                    <div className="border rounded-lg bg-background">
                        <div className="flex flex-col">
                            {history.map((topic, index) => (
                              <React.Fragment key={`${topic}-${index}`}>
                                <button
                                    className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    <span className="truncate">{topic}</span>
                                </button>
                                {index < history.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
              )}
            </div>
        </section>

        <HomePageContent />
      </main>
    </div>
  );

}
