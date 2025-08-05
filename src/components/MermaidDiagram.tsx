
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Skeleton } from './ui/skeleton';

interface MermaidDiagramProps {
  chart: string;
}

const extractMermaidDefinition = (chart: string): string => {
  const match = chart.match(/```mermaid\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : chart.trim();
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [theme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && ref.current && chart) {
      setIsLoading(true);

      // Initialize mermaid on the client side only
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });

      const renderDiagram = async () => {
        try {
          const definition = extractMermaidDefinition(chart);
          const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), definition);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Error rendering mermaid chart:", e);
          if (ref.current) {
            ref.current.innerHTML = `<p class="text-destructive">Error rendering diagram. Please check the Mermaid syntax.</p>`;
          }
        } finally {
          setIsLoading(false);
        }
      };

      renderDiagram();
    } else if (!chart) {
      setIsLoading(false);
    }
  }, [chart, theme, isMounted]);

  if (!isMounted || isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (!chart) {
    return null;
  }

  return <div ref={ref} className="mermaid-container w-full flex justify-center p-4" />;
}
