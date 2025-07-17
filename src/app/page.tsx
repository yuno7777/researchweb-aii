
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { ArrowUp, Trash2, BookOpen, FileText, ListEnd, CheckCircle2, Lightbulb, Hourglass } from 'lucide-react';

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
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.setTextColor(49, 53, 57);

                if (y + 25 > pageHeight - pageMargin) { 
                    addPageWithHeaderFooter();
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    pdf.setTextColor(49, 53, 57);
                }
                
                const sectionContent = report[sectionKey];
                const sectionTitleText = sectionTitles[sectionKey];

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
                const lineHeight = 8; 

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

  const features = [
    { icon: <BookOpen />, text: "Learns your style" },
    { icon: <FileText />, text: "Creates draft reports" },
    { icon: <Hourglass />, text: "Respects your time" },
    { icon: <ListEnd />, text: "Summarizes & compiles" },
    { icon: <Lightbulb />, text: "Understands your asks" },
    { icon: <CheckCircle2 />, text: "Finds verified sources" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <h1 className="font-sans text-2xl font-semibold tracking-wide text-primary">InsightForge</h1>
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                {navLinks.map(link => <a key={link} href="#" className="text-muted-foreground transition-colors hover:text-foreground">{link}</a>)}
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
                  className="absolute inset-0 -z-10"
                  style={{
                      backgroundImage:
                      'radial-gradient(circle at top left, hsl(var(--primary) / 0.1), transparent 30%),' +
                      'radial-gradient(circle at bottom right, hsl(var(--accent) / 0.1), transparent 30%)',
                  }}
              />
              <div className="max-w-3xl space-y-4">
                  <h2 className="font-sans text-3xl font-bold tracking-tight md:text-5xl">
                    Generate In-depth Reports with AI
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
                              <Button type="button" variant={searchType === 'web' ? 'secondary' : 'ghost'} onClick={() => setSearchType('web')} className="rounded-full">Web Search</Button>
                              <Button type="button" variant={searchType === 'deep' ? 'secondary' : 'ghost'} onClick={() => setSearchType('deep')} className="rounded-full">Deep Research</Button>
                          </div>
                      </form>
                  </Form>
              </div>
            </div>

            {isLoading && <div className="py-12"><ReportSkeleton /></div>}

            {report && !isLoading && (
              <div className="py-12 max-w-4xl mx-auto">
                <ReportDisplay report={report} onReportUpdate={handleReportUpdate} onExportPdf={handleExportPdf} />
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
                          Delete History
                      </Button>
                  </div>
                  <div className="border rounded-lg bg-background">
                      <div className="flex flex-col">
                          {history.map((topic, index) => (
                            <>
                              <button
                                  key={`${topic}-${index}`}
                                  className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                                  onClick={() => handleSelectTopic(topic)}
                              >
                                  <span className="truncate">{topic}</span>
                              </button>
                              {index < history.length - 1 && <Separator />}
                             </>
                          ))}
                      </div>
                  </div>
              </div>
            )}
        </section>

        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto flex h-[500px] items-center justify-center px-4 md:px-6">
            <div className="relative flex h-full w-full max-w-xl items-center justify-center">
                <h3 className="relative z-10 text-center font-serif text-3xl tracking-tight md:text-5xl">
                    Too many
                    <br />
                    research actions
                    <br />
                    to <span className="text-primary">handle?</span>
                </h3>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="absolute flex items-center gap-3 rounded-full border bg-card p-3 shadow-md animate-revolve"
                        style={{ animationDelay: `${index * 3}s` }}
                    >
                        {feature.icon}
                        <span className="text-muted-foreground">{feature.text}</span>
                    </div>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
