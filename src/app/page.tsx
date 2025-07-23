
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ConciseReportDisplay } from '@/components/ConciseReportDisplay';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic must be at most 100 characters long." }),
});

type ReportData = GenerateReportOutput['report'];
type SearchType = 'concise' | 'web' | 'deep';

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>('report-history', []);
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('web');
  
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
      if (!title) return '';
      return title.replace(/\b\w/g, char => char.toUpperCase());
    };
    
    let reportTitle: string;
    if ('title' in report && report.title) {
      reportTitle = capitalizeTitle(report.title);
    } else {
      reportTitle = capitalizeTitle(form.getValues('topic'));
    }

    const fileName = `InsightForge_Report_${reportTitle.replace(/ /g, '_') || 'Untitled'}.pdf`;
    
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
        const contentFontSize = 12;

        const addPageHeaderAndFooter = () => {
            if (pageNum > 1) {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor(150);
              pdf.text(`Page ${pageNum}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
              
              // Reset font for the content
              pdf.setTextColor(33, 37, 41);
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(contentFontSize);
            }
        };

        const addPageWithHeaderFooter = () => {
            pdf.addPage();
            pageNum++;
            y = pageMargin;
            addPageHeaderAndFooter();
        };

        // --- TITLE PAGE ---
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(28);
        pdf.setTextColor(32, 19, 32); 
        const titleLines = pdf.splitTextToSize(reportTitle, contentWidth - 20);
        const titleHeight = titleLines.length * (pdf.getLineHeight() / pdf.internal.scaleFactor);
        const titleY = pageHeight / 2 - titleHeight;
        pdf.text(titleLines, pdf.internal.pageSize.getWidth() / 2, titleY, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(108, 117, 125);
        pdf.text(`AI-Generated Research Report`, pdf.internal.pageSize.getWidth() / 2, titleY + titleHeight + 5, { align: 'center' });
        
        pdf.setDrawColor(222, 226, 230);
        pdf.setLineWidth(0.5);
        pdf.line(pageMargin, titleY + titleHeight + 15, contentWidth + pageMargin, titleY + titleHeight + 15);

        pdf.setFontSize(12);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.text(`Generated by InsightForge on ${date}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });
        
        // --- CONTENT PAGES ---
        const addSection = (title: string, content: string | string[]) => {
          const titleFontSize = 16;
          const sectionTitleMargin = 10;
          const contentMargin = 5;
          const lineHeightMultiplier = 1.25;

          const titleLineHeight = titleFontSize * lineHeightMultiplier / pdf.internal.scaleFactor;
          const contentLineHeight = contentFontSize * lineHeightMultiplier / pdf.internal.scaleFactor;

          // Check for page break before adding section title
          if (y + titleLineHeight + sectionTitleMargin > pageHeight - pageMargin) { 
              addPageWithHeaderFooter();
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(titleFontSize);
          pdf.setTextColor(49, 53, 57);
          pdf.text(title, pageMargin, y);
          y += titleLineHeight;
          
          pdf.setDrawColor(222, 226, 230);
          pdf.setLineWidth(0.25);
          pdf.line(pageMargin, y, contentWidth + pageMargin, y);
          y += contentMargin;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(contentFontSize);
          pdf.setTextColor(33, 37, 41);
          
          const processContent = (text: string, isListItem = false) => {
            const lines = pdf.splitTextToSize(text, isListItem ? contentWidth - 5 : contentWidth);
            lines.forEach((line: string) => {
                if (y + contentLineHeight > pageHeight - pageMargin) {
                    addPageWithHeaderFooter();
                }
                pdf.text(line, isListItem ? pageMargin + 5 : pageMargin, y);
                y += contentLineHeight;
            });
          };

          if (Array.isArray(content)) {
              content.forEach(item => {
                  processContent(`• ${item}`, true);
              });
          } else {
              processContent(content);
          }
          y += sectionTitleMargin; // Space after section
        };
        
        if (report) {
            addPageWithHeaderFooter();

            if (isConciseReport(report)) {
                 addSection('Summary', report.summary);
                 addSection('Key Points', report.keyPoints);
            } else if (isStandardReport(report)) {
                const sectionOrder: (keyof typeof report)[] = ['introduction', 'history', 'benefits', 'challenges', 'currentTrends', 'futureScope'];
                const sectionTitles: Record<string, string> = {
                  introduction: 'Introduction',
                  history: 'History',
                  benefits: 'Benefits',
                  challenges: 'Challenges',
                  currentTrends: 'Current Trends',
                  futureScope: 'Future Scope',
                };
                sectionOrder.forEach(sectionKey => {
                    const key = sectionKey as keyof typeof report;
                    if (report[key] && typeof report[key] === 'string') {
                        addSection(sectionTitles[key], report[key] as string);
                    }
                });
            }
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
      if (!history.includes(values.topic)) {
        setHistory([values.topic, ...history]);
      }
    }
    setIsLoading(false);
  };
  
  const isConciseReport = (report: ReportData | null): report is { summary: string; keyPoints: string[] } => {
    return report !== null && 'summary' in report && 'keyPoints' in report;
  };

  const isDeepReport = (report: ReportData | null): report is { title: string; report: string } => {
      return report !== null && 'report' in report && typeof report.report === 'string' && 'title' in report && !('summary' in report);
  };

  const isStandardReport = (report: ReportData | null): report is { title: string; introduction: string; history: string; benefits: string; challenges: string; currentTrends: string; futureScope: string; } => {
    return report !== null && 'introduction' in report && 'history' in report;
  }

  const renderFormattedReport = (reportText: string) => {
    const subtitleRegex = /^###\s*(.*?)(?:\s*|\n|:)/i;
    const bulletRegex = /^\s*([*•-])\s(.*)/;
    const numberedListRegex = /^\s*(\d+)\.\s(.*)/;

    const lines = reportText.split('\n').filter(line => line.trim() !== '');
    const formattedContent: JSX.Element[] = [];
    let currentList: { type: 'ul' | 'ol'; items: JSX.Element[] } | null = null;

    const flushList = () => {
        if (currentList) {
            const ListComponent = currentList.type;
            const listKey = `list-${formattedContent.length}`;
            formattedContent.push(
                <ListComponent key={listKey} className={`my-4 space-y-2 ${currentList.type === 'ol' ? 'list-decimal' : 'list-disc'} ml-6`}>
                    {currentList.items}
                </ListComponent>
            );
            currentList = null;
        }
    };
    
    const formatLine = (line: string) => {
        const parts = line.split(/\*\*(.*?)\*\*/g).map((part, i) => {
            if (i % 2 === 1) { 
                return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
            }
            return part;
        });
        return <>{parts}</>;
    };

    const formatListItem = (line: string) => {
        const firstColonIndex = line.indexOf(':');
        if (firstColonIndex !== -1) {
            const titlePart = line.substring(0, firstColonIndex + 1);
            const descriptionPart = line.substring(firstColonIndex + 1);
            return (
                <>
                    <strong className="font-semibold text-foreground">{formatLine(titlePart)}</strong>
                    <span className="text-muted-foreground">{formatLine(descriptionPart)}</span>
                </>
            );
        }
        return <span className="text-muted-foreground">{formatLine(line)}</span>;
    };


    lines.forEach((line, index) => {
        const subtitleMatch = line.match(subtitleRegex);
        if (subtitleMatch) {
            flushList();
            formattedContent.push(<h3 key={`h3-${index}`} className="text-2xl font-bold text-foreground mt-8 mb-4">{subtitleMatch[1].trim()}</h3>);
            return;
        }

        const bulletMatch = line.match(bulletRegex);
        if (bulletMatch) {
            if (!currentList || currentList.type !== 'ul') {
                flushList();
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(<li key={`li-${index}`}>{formatListItem(bulletMatch[2])}</li>);
            return;
        }
        
        const numberedMatch = line.match(numberedListRegex);
        if (numberedMatch) {
            if (!currentList || currentList.type !== 'ol') {
                flushList();
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(<li key={`li-${index}`}>{formatListItem(numberedMatch[2])}</li>);
            return;
        }
        
        flushList();
        formattedContent.push(<p key={`p-${index}`} className="mb-4 text-muted-foreground leading-relaxed">{formatLine(line)}</p>);
    });
    
    flushList();

    return <div className="prose dark:prose-invert max-w-none">{formattedContent}</div>;
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
                      </form>
                  </Form>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSearchType('web')}
                                  className={cn(
                                      "rounded-full",
                                      searchType === 'web' && 'bg-muted text-foreground'
                                  )}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                  Web search
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Enable web search for brief, factual information from the internet (150-350 words)</p>
                          </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchType('deep')}
                                    className={cn(
                                        "rounded-full",
                                        searchType === 'deep' && 'bg-muted text-foreground'
                                    )}
                                >
                                    <BrainCircuit className="h-4 w-4 mr-2" />
                                    Deep research
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Enable Deep Research for extensive academic-style analysis (approx. 1600 words)</p>
                            </TooltipContent>
                        </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSearchType('concise')}
                                  className={cn(
                                      "rounded-full",
                                      searchType === 'concise' && 'bg-muted text-foreground'
                                  )}
                              >
                                  <List className="h-4 w-4 mr-2" />
                                  Concise Response
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Get a 300-word summary and 10-15 key takeaways.</p>
                          </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
              </div>
            </div>
            
            <div id="report-output">
              {isLoading && <div className="py-12"><ReportSkeleton /></div>}

              {report && !isLoading && (
                <div className="py-12 max-w-4xl mx-auto">
                   <div className="flex justify-end mb-4">
                      <Button onClick={handleExportPdf} className="rounded-full">
                          <FileDown className="mr-2 h-4 w-4" />
                          Export as PDF
                      </Button>
                    </div>
                  <Card>
                    {isConciseReport(report) ? (
                        <CardContent className="p-0">
                           <ConciseReportDisplay report={report} onReportUpdate={handleReportUpdate} topic={form.getValues('topic')} />
                        </CardContent>
                    ) : isDeepReport(report) ? (
                      <>
                        <CardHeader>
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription>A deep-dive report about "{form.getValues('topic')}".</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderFormattedReport(report.report)}
                        </CardContent>
                      </>
                    ) : isStandardReport(report) ? (
                      <CardContent className="p-0">
                        <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />
                      </CardContent>
                    ) : null}
                  </Card>
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
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear History
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

    