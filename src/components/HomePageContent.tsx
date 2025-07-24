
'use client';

import React from 'react';
import { BookOpen, BrainCircuit, Code, FileDigit, FileText, ListEnd, Mic, Search, Check, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/GradientText';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function HomePageContent() {

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Leverage generative AI to analyze complex topics and produce structured, insightful report sections from a single prompt.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Structured Reports",
      description: "Automatically generate reports with standard sections like Introduction, History, Benefits, and Challenges.",
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Deep Research",
      description: "Go beyond surface-level searches. Our Deep Research mode performs iterative analysis to uncover verified insights.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "In-Place Editing",
      description: "Refine and customize your generated report directly in the browser with a simple, intuitive editor for each section.",
    },
    {
      icon: <FileDigit className="h-8 w-8 text-primary" />,
      title: 'PDF & TXT Exports',
      description: 'Export your finalized reports in multiple formats, including selectable-text PDFs and plain text files for easy sharing.',
    },
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: 'Voice-to-Text',
      description: 'Dictate your research queries or edit reports using your voice, offering a hands-free and accessible way to work.',
    },
    {
      icon: <ListEnd className="h-8 w-8 text-primary" />,
      title: 'Query History',
      description: 'Never lose your train of thought. Access your previous research topics and regenerate reports with a single click.',
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: 'Developer Focused',
      description: 'Built with developers in mind, offering a flexible and extensible platform for custom research workflows.',
    },
  ];

  const processSteps = [
    {
      title: "Start a chat",
      description: "Kick off a conversation to explore your query with Insight Forge.",
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
      price: '₹0',
      features: [
        '10 Research Credits per month',
        '5 Deep Research Requests',
        '5 Web Searches',
        '5 Gemini 2.5 Pro Usage',
        '2 AI-Generated Research Reports per month',
        '1 Project Workspaces'
      ],
      footer: "A great way to experience Insight Forge's magic without any commitment."
    },
    pro: {
      title: 'Pro Plan',
      description: 'For serious researchers and innovation teams.',
      price: '₹250',
      features: [
        'Unlimited Research Credits per month',
        '50 Deep Research Requests',
        'Unlimited Web Searches',
        'Unlimited Gemini 2.5 Pro Usage',
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
      question: "What is Insight Forge?",
      answer: "Insight Forge is an AI-powered research assistant designed to help you generate comprehensive, well-structured reports on any topic. It uses advanced AI to gather, analyze, and present information, saving you time and effort."
    },
    {
      question: "How do I get started with Insight Forge?",
      answer: "Getting started is simple! Just type a topic into the search bar on the homepage and click the generate button. Our AI will then create a detailed report for you in seconds. You can then edit, save, or export the report as needed."
    },
    {
      question: "What types of reports can I create?",
      answer: "You can create a wide variety of reports on virtually any subject, from scientific research and market analysis to historical summaries and technical papers. The AI is designed to be versatile and can adapt to different content requirements."
    },
    {
      question: "Is Insight Forge free to use?",
      answer: "Yes, we offer a free plan with a generous number of credits per month, which is perfect for casual users and exploring the platform. For more intensive research needs, our Pro plan offers unlimited access and advanced features."
    },
    {
      question: "Can I use Insight Forge on mobile devices?",
      answer: "Absolutely! Insight Forge is fully responsive and works seamlessly on desktops, tablets, and mobile phones. You can conduct research and generate reports from anywhere, at any time."
    },
    {
      question: "How does the deep research assistant work?",
      answer: "The deep research feature performs an iterative and in-depth analysis of web and data sources. It goes beyond a simple search to synthesize information, identify key trends, and provide verified insights, ensuring your reports are both comprehensive and reliable."
    }
  ];
    
  return (
    <>
      <section id="features" className="w-full py-20 md:py-32 bg-background">
        <ScrollAnimation>
          <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl text-center space-y-4 mb-16">
                  <h2 className="font-sans text-3xl tracking-tight md:text-5xl">
                      <GradientText>An AI Research Assistant That Works For You</GradientText>
                  </h2>
                  <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                      From automated report generation to in-depth analysis, Insight Forge provides the tools you need to accelerate your research workflow.
                  </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative rounded-xl p-px transition-all duration-300 bg-zinc-900/50 hover:bg-zinc-800"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative h-full w-full rounded-[11px] bg-card p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        {feature.icon}
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
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
              <h2 className="font-sans text-3xl tracking-tight md:text-5xl">
                <GradientText>From Chat to Research Report, <span className="text-primary !bg-none">Instantly!</span></GradientText>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Ever had a brilliant question snowball into something bigger? Insight Forge doesn&apos;t just answer - it documents the journey:
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-4">
              {processSteps.map((step, index) => (
                
                  <div key={index} className="flex flex-col items-start text-left">
                    <p className="font-sans text-7xl text-muted-foreground/50">0{index + 1}</p>
                    <h3 className="mt-4 text-xl font-semibold text-primary">{step.title}</h3>
                    <p className="mt-2 text-base text-muted-foreground">{step.description}</p>
                  </div>
                
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
              <h2 className="font-sans text-4xl tracking-tight md:text-6xl">
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
                
                  <div key={feature.title} className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">{feature.title}</h3>
                    <Separator />
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </section>

      <section id="pricing" className="w-full py-20 md:py-32 bg-muted/20">
        <ScrollAnimation>
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center space-y-4">
              <h2 className="font-sans text-3xl tracking-tight md:text-5xl">
                <GradientText>Flexible Plans for Every Need</GradientText>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Choose the plan that's right for you and unlock the full power of AI-driven research.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[pricingPlans.free, pricingPlans.pro].map((plan, index) => (
                
                  <div key={plan.title} className={cn("rounded-xl p-8 flex flex-col h-full", index === 0 ? "bg-card" : "bg-card border-2 border-primary shadow-lg")}>
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
                
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </section>

      <section id="faq" className="w-full py-20 md:py-32 bg-background">
        <ScrollAnimation>
          <div className="container mx-auto max-w-4xl px-4 md:px-6">
              <h2 className="text-center font-sans text-3xl tracking-tight md:text-5xl mb-12">
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
    </>
  );
}
