
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Skeleton } from './ui/skeleton';

interface MermaidDiagramProps {
  chart: string;
}

// Helper to extract the pure Mermaid definition from markdown code blocks
const extractMermaidDefinition = (chart: string): string => {
  const match = chart.match(/```mermaid\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : chart.trim();
};

mermaid.initialize({
  startOnLoad: false,
  theme: 'default', // Initial theme, will be updated in effect
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [theme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This ensures the component has mounted on the client before trying to render
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && ref.current && chart) {
      setIsLoading(true);
      try {
        const definition = extractMermaidDefinition(chart);

        // Update theme config before rendering
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
        });
        
        // Using async/await to handle the asynchronous rendering
        const renderDiagram = async () => {
          try {
            // mermaid.render returns a promise with the rendered SVG code
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
        
      } catch (e) {
        console.error("Caught a sync error during mermaid setup:", e);
        if (ref.current) {
            ref.current.innerHTML = `<p class="text-destructive">Error initializing diagram.</p>`;
        }
        setIsLoading(false);
      }
    } else if (chart) {
        // Still loading or ref not available yet
        setIsLoading(true);
    } else {
        setIsLoading(false);
    }
  }, [chart, theme, isMounted]);

  if (!isMounted || isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <div ref={ref} className="mermaid-container w-full flex justify-center p-4" />;
}
