'use client';

import { useState, useEffect } from 'react';
import type { GenerateReportOutput } from '@/ai/flows/generate-report';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';

type Report = GenerateReportOutput['report'];
type ReportSection = keyof Report;

interface ReportDisplayProps {
  report: Report;
  onReportUpdate: (updatedReport: Report) => void;
}

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

  const reportSections = Object.keys(report) as ReportSection[];

  return (
    <Accordion type="multiple" defaultValue={reportSections} className="w-full space-y-4">
      {reportSections.map((sectionKey) => (
        <AccordionItem value={sectionKey} key={sectionKey} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <AccordionTrigger className="p-6 hover:no-underline text-left">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex-1">{sectionTitles[sectionKey]}</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6">
              {editingSection === sectionKey ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px] text-base leading-relaxed"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelClick}><X className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button size="sm" onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" />Save</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{editableReport[sectionKey]}</p>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(sectionKey)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
