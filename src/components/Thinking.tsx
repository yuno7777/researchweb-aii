
'use client';

import { CheckCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  "Parsing user request",
  "Analyzing topic",
  "Gathering information",
  "Cross-referencing sources",
  "Identifying key themes",
  "Structuring report",
  "Generating content",
  "Finalizing report"
];

export function Thinking() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 border rounded-lg bg-card shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Thinking...</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-4">
            {index < currentStep && <CheckCircle className="h-5 w-5 text-green-500" />}
            {index === currentStep && <LoaderCircle className="h-5 w-5 text-primary animate-spin" />}
            {index > currentStep && <div className="h-5 w-5 border-2 border-muted rounded-full" />}
            <span className={`text-lg ${index > currentStep ? 'text-muted-foreground' : 'text-foreground'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
