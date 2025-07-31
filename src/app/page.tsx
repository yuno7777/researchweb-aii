
'use client';

import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { ArrowUp, Menu, Trash2, FileText, List, FileDown, Brain, Book, Link, Settings, Sparkles, Plus, FolderKanban, Send, Paperclip } from 'lucide-react';

import type { GenerateReportOutput, GenerateReportInput } from '@/ai/flows/generate-report';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { handleGenerateReport } from './actions';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ConciseReportDisplay } from '@/components/ConciseReportDisplay';
import { ReportDisplay } from '@/components/ReportDisplay';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { Thinking } from '@/components/Thinking';
import { TemplateManager, type Template } from '@/components/TemplateManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic must be at most 100 characters long." }),
});

type ReportData = GenerateReportOutput['report'];
type SearchType = 'concise' | 'web' | 'deep';

const defaultSections: string[] = [
    'Introduction',
    'History',
    'Benefits',
    'Challenges',
    'Current Trends',
    'Future Scope',
];

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>('report-history', []);
  const [templates, setTemplates] = useLocalStorage<Template[]>('report-templates', []);
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>('web');
  const [generateWithReferences, setGenerateWithReferences] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(defaultSections);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default');

  
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

    const fileName = `Insight Forge_Report_${reportTitle.replace(/ /g, '_') || 'Untitled'}.pdf`;
    
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
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(150);
            pdf.text(`Page ${pageNum}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
            
            // Reset font for the content
            pdf.setTextColor(33, 37, 41);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(contentFontSize);
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
        pdf.text(`Generated by Insight Forge on ${date}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });
        
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
          
          const processContent = (text: string) => {
            const lines = pdf.splitTextToSize(text, contentWidth);
            lines.forEach((line: string) => {
              if (y + contentLineHeight > pageHeight - pageMargin) {
                  addPageWithHeaderFooter();
              }
              pdf.text(line, pageMargin, y);
              y += contentLineHeight;
            });
          };

          if (Array.isArray(content)) {
              content.forEach(item => {
                  processContent(`• ${item}`);
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
                 if (report.sources) addSection('Sources', report.sources);
            } else if (isStandardOrDeepReport(report)) {
                if (report.introduction) addSection('Introduction', report.introduction);
                if (report.history) addSection('History', report.history);
                if (report.benefits) addSection('Benefits', report.benefits);
                if (report.challenges) addSection('Challenges', report.challenges);
                if (report.currentTrends) addSection('Current Trends', report.currentTrends);
                if (report.futureScope) addSection('Future Scope', report.futureScope);
                if (report.sources) addSection('Sources', report.sources);
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

    const result = await handleGenerateReport({ 
        topic: values.topic, 
        searchType, 
        generateWithReferences,
        sections: searchType === 'concise' ? undefined : selectedSections,
    });

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
  
  const isConciseReport = (report: ReportData | null): report is { summary: string; keyPoints: string[], sources?: string } => {
    return report !== null && 'summary' in report && 'keyPoints' in report;
  };

  const isStandardOrDeepReport = (report: ReportData | null): report is Exclude<ReportData, { summary: string; keyPoints: string[] } | null> => {
      return report !== null && 'title' in report && !('summary' in report);
  };
  
  const handleTemplateSelect = (templateId: string) => {
    setActiveTemplateId(templateId);
    if (templateId === 'default') {
        setSelectedSections(defaultSections);
    } else if (templateId === 'custom') {
        setSelectedSections([]);
    } else {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedSections(template.sections);
        }
    }
  };

  return (
    <div id="home" className="flex min-h-screen w-full flex-col bg-background text-foreground" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <a href="#home" className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <h1 className="font-sans text-xl font-semibold tracking-wider text-primary">Insight Forge</h1>
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
                    Insight Forge leverages cutting-edge AI to create comprehensive, well-structured research reports on any topic in seconds.
                  </p>
              </div>

                <div className="mt-8 w-full max-w-4xl">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="rounded-3xl border bg-card p-2 shadow-lg dark:bg-zinc-900/50">
                                <FormField
                                    control={form.control}
                                    name="topic"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Ask anything..."
                                                        className="h-12 w-full rounded-xl border-none bg-transparent py-4 pl-6 pr-4 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="pl-4 text-left"/>
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2 px-2">
                                   <div className="flex flex-wrap items-center gap-2">
                                        <TooltipProvider>
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => setSearchType('web')}
                                                      className={cn(
                                                          "rounded-full text-muted-foreground",
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
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSearchType('deep')}
                                                        className={cn(
                                                            "rounded-full text-muted-foreground",
                                                            searchType === 'deep' && 'bg-muted text-foreground'
                                                        )}
                                                    >
                                                        <Brain className="h-4 w-4 mr-2" />
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
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => setSearchType('concise')}
                                                      className={cn(
                                                          "rounded-full text-muted-foreground",
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
                                    <div className="flex items-center gap-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-4">
                                                <div className="grid gap-4">
                                                  
                                                  <div className="grid gap-2">
                                                    {searchType !== 'concise' && (
                                                      <>
                                                        <div className="space-y-2">
                                                            <Label>Template</Label>
                                                            <div className="flex gap-2">
                                                                <Select value={activeTemplateId} onValueChange={handleTemplateSelect}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a template" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="default">Default Sections</SelectItem>
                                                                        {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                                        <SelectItem value="custom">Custom...</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button variant="outline" size="icon" onClick={() => setIsTemplateManagerOpen(true)}>
                                                                    <FolderKanban className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                            {selectedSections.map((section, index) => (
                                                                <div key={index} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`section-${index}`}
                                                                        checked={true}
                                                                        onCheckedChange={(checked) => {
                                                                            if (!checked) {
                                                                                setSelectedSections(selectedSections.filter((s) => s !== section));
                                                                                setActiveTemplateId('custom');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`section-${index}`} className="font-normal">{section}</Label>
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedSections([...selectedSections, 'New Section']); setActiveTemplateId('custom'); }}>
                                                                <Plus className="mr-2 h-4 w-4" /> Add Section
                                                            </Button>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="references-switch"
                                                            checked={generateWithReferences}
                                                            onCheckedChange={setGenerateWithReferences}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Include a list of sources in the report.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button type="submit" size="icon" className="rounded-full h-9 w-9 bg-primary/90 hover:bg-primary" disabled={isLoading}>
                                            <Send className="h-5 w-5"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
            
            <div id="report-output">
              {isLoading && <Thinking />}

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
                    ) : isStandardOrDeepReport(report) ? (
                      <ReportDisplay report={report} onReportUpdate={handleReportUpdate} />
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

        <TemplateManager
            isOpen={isTemplateManagerOpen}
            onOpenChange={setIsTemplateManagerOpen}
            templates={templates}
            setTemplates={setTemplates}
        />

        <HomePageContent />
      </main>
    </div>
  );
}

    