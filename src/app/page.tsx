

'use client';

import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { ArrowUp, Trash2, BookOpen, FileText, ListEnd, CheckCircle2, Lightbulb, Hourglass, Check, Plus } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Reports", href: "#reports" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const features = [
    { icon: <BookOpen />, text: "Learns your style" },
    { icon: <FileText />, text: "Creates draft reports" },
    { icon: <Hourglass />, text: "Respects your time" },
    { icon: <ListEnd />, text: "Summarizes & compiles" },
    { icon: <Lightbulb />, text: "Understands your asks" },
    { icon: <CheckCircle2 />, text: "Finds verified sources" },
  ];

  const processSteps = [
    {
      title: "Start a chat",
      description: "Kick off a conversation to explore your query with InsightForge.",
    },
    {
      title: "Trigger deep research",
      description: "Activate DeepSearch for in-depth, iterative web and data analysis.",
    },
    {
      title: "Tap \"Create Report\"",
      description: "Generate a structured report from your chat insights.",
    },
    {
      title: "Executive, Find, Export",
      description: "Get an executive summary, key findings, and export-ready report.",
    },
  ];

  const libraryFeatures = [
    {
      title: "Research Reports",
      description: "In-depth insights tailored to your queries, powered by real-time web and data analysis."
    },
    {
      title: "Projects",
      description: "Collaborate on tasks with structured AI assistance, from brainstorming to execution."
    },
    {
      title: "Chat History",
      description: "Seamless access to our past conversations for context and continuity."
    }
  ];

  const pricingPlans = {
    free: {
      title: 'Free Plan',
      description: 'Perfect for light explorers.',
      price: '$0',
      features: [
        '10 Research Credits per month',
        '5 Deep Research Requests',
        '5 Web Searches',
        '5 GPT-4o Usage',
        '2 AI-Generated Research Reports per month',
        '1 Project Workspaces'
      ],
      footer: "A great way to experience InsightForge's magic without any commitment."
    },
    pro: {
      title: 'Pro Plan',
      description: 'For serious researchers and innovation teams.',
      price: '$19',
      features: [
        'Unlimited Research Credits per month',
        '50 Deep Research Requests',
        'Unlimited Web Searches',
        'Unlimited GPT-4o Usage',
        '100 AI-Generated Research Reports per month',
        '20 Project Workspaces',
        'Access to Premium AI Models',
        'Priority Processing',
        'Early Access to New Features'
      ],
      footer: 'Push the boundaries of discovery without limits.'
    }
  };

  const faqItems = [
    {
      question: "What is InsightForge?",
      answer: "InsightForge is an AI-powered research assistant designed to help you generate comprehensive, well-structured reports on any topic. It uses advanced AI to gather, analyze, and present information, saving you time and effort."
    },
    {
      question: "How do I get started with InsightForge?",
      answer: "Getting started is simple! Just type a topic into the search bar on the homepage and click the generate button. Our AI will then create a detailed report for you in seconds. You can then edit, save, or export the report as needed."
    },
    {
      question: "What types of reports can I create?",
      answer: "You can create a wide variety of reports on virtually any subject, from scientific research and market analysis to historical summaries and technical papers. The AI is designed to be versatile and can adapt to different content requirements."
    },
    {
      question: "Is InsightForge free to use?",
      answer: "Yes, we offer a free plan with a generous number of credits per month, which is perfect for casual users and exploring the platform. For more intensive research needs, our Pro plan offers unlimited access and advanced features."
    },
    {
      question: "Can I use InsightForge on mobile devices?",
      answer: "Absolutely! InsightForge is fully responsive and works seamlessly on desktops, tablets, and mobile phones. You can conduct research and generate reports from anywhere, at any time."
    },
    {
      question: "How does the deep research assistant work?",
      answer: "The deep research feature performs an iterative and in-depth analysis of web and data sources. It goes beyond a simple search to synthesize information, identify key trends, and provide verified insights, ensuring your reports are both comprehensive and reliable."
    }
  ];


  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <h1 className="font-sans text-xl font-semibold tracking-wider text-primary">InsightForge</h1>
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
                              <Button type="button" variant={searchType === 'web' ? 'secondary' : 'ghost'} onClick={() => setSearchType('web')} className="rounded-full">Web Search</Button>
                              <Button type="button" variant={searchType === 'deep' ? 'secondary' : 'ghost'} onClick={() => setSearchType('deep')} className="rounded-full">Deep Research</Button>
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

        <section id="features" className="w-full py-20 md:py-32 bg-background">
          <ScrollAnimation>
            <div className="container mx-auto flex h-[500px] items-center justify-center px-4 md:px-6">
              <div className="relative flex h-full w-full max-w-xl items-center justify-center">
                  <h3 className="relative z-10 text-center font-sans text-3xl tracking-tight md:text-5xl">
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
          </ScrollAnimation>
        </section>

        <section id="how-it-works" className="w-full py-20 md:py-32 bg-muted/20">
          <ScrollAnimation>
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl text-center space-y-4">
                <h2 className="font-serif text-3xl tracking-tight md:text-5xl">
                  <GradientText>From Chat to Research Report, <span className="text-primary !bg-none">Instantly!</span></GradientText>
                </h2>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                  Ever had a brilliant question snowball into something bigger? InsightForge doesn&apos;t just answer - it documents the journey:
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-4">
                {processSteps.map((step, index) => (
                  <ScrollAnimation key={index} delay={index * 0.1}>
                    <div className="flex flex-col items-start text-left">
                      <p className="font-serif text-7xl text-muted-foreground/50">0{index + 1}</p>
                      <h3 className="mt-4 text-xl font-semibold text-primary">{step.title}</h3>
                      <p className="mt-2 text-base text-muted-foreground">{step.description}</p>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        </section>

        <section id="reports" className="w-full py-20 md:py-32 bg-background relative overflow-hidden">
          <ScrollAnimation>
            <div
                className="absolute inset-y-0 right-0 -z-10 w-1/2"
                style={{
                    backgroundImage:
                    'radial-gradient(circle at 100% 50%, hsl(var(--primary) / 0.1), transparent 50%)',
                }}
            />
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 md:px-6">
              <div className="space-y-4">
                <h2 className="font-serif text-4xl tracking-tight md:text-6xl">
                  Your Research Library,
                  <br />
                  <span className="text-primary">Reimagined.</span>
                </h2>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-muted-foreground">
                  Everything you ask.
                  <br />
                  Everything you get.
                  <br />
                  Neatly organized under:
                </p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mt-12">
                {libraryFeatures.map((feature, index) => (
                  <ScrollAnimation key={feature.title} delay={index * 0.1}>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary">{feature.title}</h3>
                      <Separator />
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        </section>

        <section id="pricing" className="w-full py-20 md:py-32 bg-muted/20">
          <ScrollAnimation>
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl text-center space-y-4">
                <h2 className="font-serif text-3xl tracking-tight md:text-5xl">
                  <GradientText>Flexible Plans for Every Need</GradientText>
                </h2>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                  Choose the plan that's right for you and unlock the full power of AI-driven research.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[pricingPlans.free, pricingPlans.pro].map((plan, index) => (
                  <ScrollAnimation key={plan.title} delay={index * 0.1}>
                    <div className={cn("rounded-xl p-8 flex flex-col h-full", index === 0 ? "bg-card" : "bg-card border-2 border-primary shadow-lg")}>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold">{plan.title}</h3>
                            <p className="text-muted-foreground mt-1">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold text-primary">{plan.price}</p>
                            <p className="text-muted-foreground">month</p>
                          </div>
                        </div>
                        <ul className="mt-8 space-y-4">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                              <Check className="h-5 w-5 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-8">
                        <p className="text-sm text-muted-foreground">{plan.footer}</p>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        </section>

        <section id="faq" className="w-full py-20 md:py-32 bg-background">
          <ScrollAnimation>
            <div className="container mx-auto max-w-4xl px-4 md:px-6">
                <h2 className="text-center font-serif text-3xl tracking-tight md:text-5xl mb-12">
                  <GradientText>Frequently Asked Questions</GradientText>
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg text-left hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                  ))}
                </Accordion>
            </div>
          </ScrollAnimation>
        </section>

      </main>
    </div>
  );

}
