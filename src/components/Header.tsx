'use client';

import { FileDown, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onExport: () => void;
  isReportReady: boolean;
}

export function Header({ onExport, isReportReady }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">InsightForge</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onExport}
              disabled={!isReportReady}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
