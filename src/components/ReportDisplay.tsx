
'use client';

import { useState, useEffect } from 'react';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from './ui/card';
import { MermaidDiagram } from './MermaidDiagram';

type Report = Exclude<GenerateReportOutput['report'], { summary: string, keyPoints: string[] } | null>;
type ReportSection = keyof Omit<Report, 'title'>;

interface ReportDisplayProps {
  report: Report;
  onReportUpdate: (updatedReport: Report) => void;
}

export function ReportDisplay({ report, onReportUpdate }: ReportDisplayProps) {
  const [editableReport, setEditableReport] = useState<Report>(report);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setEditableReport(report);
  }, [report]);

  const handleEditClick = (section: ReportSection) => {
    setEditingSection(section);
    setEditContent((editableReport as any)[section] || '');
  };

  const handleSaveClick = () => {
    if (!editingSection) return;
    const updatedReport = { ...editableReport, [editingSection]: editContent };
    setEditableReport(updatedReport);
    onReportUpdate(updatedReport);
    setEditingSection(null);
  };

  const handleCancelClick = () => {
    setEditingSection(null);
  };

  return (
    <>
        <CardHeader>
            <CardTitle>{report.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <div className="flex flex-row items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Report</h3>
                    {editingSection !== 'reportContent' && (
                        <Button variant="outline" size="sm" onClick={() => handleEditClick('reportContent')} className="rounded-full"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                    )}
                </div>
                
                {editingSection === 'reportContent' ? (
                    <div className="space-y-4">
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[250px] text-base leading-relaxed rounded-lg"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelClick} className="rounded-full"><X className="mr-2 h-4 w-4" />Cancel</Button>
                        <Button size="sm" onClick={handleSaveClick} className="rounded-full"><Save className="mr-2 h-4 w-4" />Save</Button>
                    </div>
                    </div>
                ) : (
                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{editableReport.reportContent}</p>
                )}
            </div>
             {report.erd && (
              <div className="mermaid-diagram-container">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">Entity Relationship Diagram</h3>
                  {editingSection !== 'erd' && (
                    <Button variant="outline" size="sm" onClick={() => handleEditClick('erd')} className="rounded-full"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                  )}
                </div>
                {editingSection === 'erd' ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[250px] text-base leading-relaxed rounded-lg font-mono"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleCancelClick} className="rounded-full"><X className="mr-2 h-4 w-4" />Cancel</Button>
                      <Button size="sm" onClick={handleSaveClick} className="rounded-full"><Save className="mr-2 h-4 w-4" />Save</Button>
                    </div>
                  </div>
                ) : (
                  <MermaidDiagram diagram={editableReport.erd ?? ''} />
                )}
              </div>
            )}
        </CardContent>
    </>
  );
}
