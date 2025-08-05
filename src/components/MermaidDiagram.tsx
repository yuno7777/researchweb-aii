
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Skeleton } from './ui/skeleton';

// Generate a random ID for each diagram
const generateId = () => `mermaid-diagram-${Math.random().toString(36).substring(2, 9)}`;

interface MermaidDiagramProps {
  diagram: string;
}

export function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const [theme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = useRef(generateId());

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure diagram text is a valid string
        const diagramText = typeof diagram === 'string' ? diagram.trim() : '';
        if (!diagramText) {
          setError('No diagram text provided.');
          setIsLoading(false);
          return;
        }

        const { svg } = await mermaid.render(id.current, diagramText);
        setSvgContent(svg);
      } catch (e: any) {
        console.error('Mermaid rendering error:', e);
        setError(e.message || 'Failed to render diagram.');
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [diagram, theme]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/50 rounded-lg">
        <h4 className="font-bold">Diagram Error</h4>
        <pre className="whitespace-pre-wrap text-sm">{error}</pre>
      </div>
    );
  }

  if (svgContent) {
    return (
        <div 
            className="flex justify-center items-center" 
            dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
    );
  }

  return null;
}
