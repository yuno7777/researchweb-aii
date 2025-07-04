'use client';

import { useState, useEffect } from 'react';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';

type Report = GenerateReportOutput['report'];
type ReportSection = keyof Report;

interface ReportDisplayProps {
  report: Report;
  onReportUpdate: (updatedReport: Report) => void;
}

const sectionOrder: ReportSection[] = [
  'introduction',
  'history',
  'benefits',
  'challenges',
  'currentTrends',
  'futureScope',
];

const sectionTitles: Record<ReportSection, string> = {
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
    setEditContent(editableReport[section]);
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
    <div className="space-y-8">
      {sectionOrder.map((sectionKey) => (
        report[sectionKey] && (
            <Card key={sectionKey} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-6">
                    <CardTitle className="text-2xl">{sectionTitles[sectionKey]}</CardTitle>
                    {editingSection !== sectionKey && (
                         <Button variant="outline" size="sm" onClick={() => handleEditClick(sectionKey)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                    )}
                </CardHeader>
                <CardContent className="px-6 pb-6">
                {editingSection === sectionKey ? (
                    <div className="space-y-4">
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[300px] text-base leading-relaxed"
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelClick}><X className="mr-2 h-4 w-4" />Cancel</Button>
                        <Button size="sm" onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" />Save</Button>
                    </div>
                    </div>
                ) : (
                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{editableReport[sectionKey]}</p>
                )}
                </CardContent>
            </Card>
        )
      ))}
    </div>
  );
}
