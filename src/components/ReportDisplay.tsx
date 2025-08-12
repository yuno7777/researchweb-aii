
'use client';

import { useState, useEffect } from 'react';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from './ui/card';
import { MermaidDiagram } from './MermaidDiagram';
import { Separator } from './ui/separator';

type Report = Exclude<GenerateReportOutput, { summary: string, keyPoints: string[] } | null>;
type EditableSection = keyof Report['sections'] | 'erd';

const sectionTitles: Record<keyof Report['sections'], string> = {
  introduction: 'Introduction',
  history: 'History',
  benefits: 'Benefits',
  challenges: 'Challenges',
  currentTrends: 'Current Trends',
  futureScope: 'Future Scope',
};

export function ReportDisplay({ report, onReportUpdate }: ReportDisplayProps) {
  const [editableReport, setEditableReport] = useState<Report>(report);
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setEditableReport(report);
  }, [report]);

  const handleEditClick = (section: EditableSection) => {
    setEditingSection(section);
    if (section === 'erd') {
      setEditContent(editableReport.erd ?? '');
    } else {
      setEditContent(editableReport.sections[section] || '');
    }
  };

  const handleSaveClick = () => {
    if (!editingSection) return;

    let updatedReport: Report;
    if (editingSection === 'erd') {
      updatedReport = { ...editableReport, erd: editContent };
    } else {
      const updatedSections = {
        ...editableReport.sections,
        [editingSection]: editContent,
      };
      updatedReport = { ...editableReport, sections: updatedSections };
    }
    
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
            {Object.entries(report.sections).map(([key, content]) => {
              const sectionKey = key as keyof Report['sections'];
              return (
                <div key={key}>
                    <div className="flex flex-row items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{sectionTitles[sectionKey]}</h3>
                        {editingSection !== sectionKey && (
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(sectionKey)} className="rounded-full"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                        )}
                    </div>
                    
                    {editingSection === sectionKey ? (
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
                        <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
                    )}
                </div>
              );
            })}
             
             {report.erd && (
              <div>
                <Separator className="my-6"/>
                <div className="mermaid-diagram-container">
                  <div className="flex flex-row items-center justify-end mb-2">
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
              </div>
            )}
        </CardContent>
    </>
  );
}

interface ReportDisplayProps {
  report: Report;
  onReportUpdate: (updatedReport: Report) => void;
}
