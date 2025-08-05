
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { Skeleton } from './ui/skeleton';

interface MermaidDiagramProps {
  chart: string;
}

// Helper to extract the pure Mermaid definition from markdown code blocks
const extractMermaidDefinition = (chart: string): string => {
  const match = chart.match(/```mermaid\n([\s\S]*?)\n```/);
  return match ? match[1] : chart;
};


export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && ref.current && chart) {
      try {
        const definition = extractMermaidDefinition(chart);
        
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        
        mermaid.render('mermaid-graph-' + Date.now(), definition, (svgCode) => {
            if (ref.current) {
                ref.current.innerHTML = svgCode;
            }
        });
      } catch (e) {
        console.error("Error rendering mermaid chart:", e);
        if (ref.current) {
            ref.current.innerHTML = `<p class="text-destructive">Error rendering diagram. Please check the Mermaid syntax.</p>`;
        }
      }
    }
  }, [chart, resolvedTheme, isMounted]);

  if (!isMounted) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <div ref={ref} className="mermaid-container w-full flex justify-center" />;
}
