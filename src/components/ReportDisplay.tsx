
'use client';

import { useState, useEffect } from 'react';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { Separator } from './ui/separator';

type Report = Exclude<GenerateReportOutput['report'], { summary: string, keyPoints: string[] } | { title: string, report: string }>;
type ReportSection = keyof Report;

interface ReportDisplayProps {
  report: Report;
  onReportUpdate: (updatedReport: Report) => void;
}

const sectionOrder: ReportSection[] = [
  'title',
  'introduction',
  'history',
  'benefits',
  'challenges',
  'currentTrends',
  'futureScope',
];

const sectionTitles: Record<ReportSection, string> = {
  title: 'Title',
  introduction: 'Introduction',
  history: 'History',
  benefits: 'Benefits',
  challenges: 'Challenges',
  currentTrends: 'Current Trends',
  futureScope: 'Future Scope',
};

export function ReportDisplay({ report, onReportUpdate }: ReportDisplayProps) {
  const [editableReport, setEditableReport] = useState<Report>(report);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setEditableReport(report);
  }, [report]);

  const handleEditClick = (section: ReportSection) => {
    setEditingSection(section);
    setEditContent(editableReport[section] as string);
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
    <div className="space-y-8 p-8">
        {sectionOrder.map((sectionKey) => (
          (report as any)[sectionKey] && (
              <div key={sectionKey}>
                  <div className="flex flex-row items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">{sectionTitles[sectionKey]}</h2>
                      {editingSection !== sectionKey && (
                           <Button variant="outline" size="sm" onClick={() => handleEditClick(sectionKey as ReportSection)} className="rounded-full"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                      )}
                  </div>
                  <Separator className="mb-6"/>
                  
                  {editingSection === sectionKey ? (
                      <div className="space-y-4">
                      <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[300px] text-base leading-relaxed rounded-lg"
                      />
                      <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelClick} className="rounded-full"><X className="mr-2 h-4 w-4" />Cancel</Button>
                          <Button size="sm" onClick={handleSaveClick} className="rounded-full"><Save className="mr-2 h-4 w-4" />Save</Button>
                      </div>
                      </div>
                  ) : (
                      <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{(editableReport as any)[sectionKey]}</p>
                  )}
              </div>
          )
        ))}
      </div>
  );
}
