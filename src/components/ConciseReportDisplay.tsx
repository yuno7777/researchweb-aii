
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { Separator } from './ui/separator';
import { CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

interface ConciseReport {
  summary: string;
  keyPoints: string[];
}

interface ConciseReportDisplayProps {
  report: ConciseReport;
  onReportUpdate: (updatedReport: ConciseReport) => void;
  topic: string;
}

export function ConciseReportDisplay({ report, onReportUpdate, topic }: ConciseReportDisplayProps) {
  const [editableReport, setEditableReport] = useState(report);
  const [editingSection, setEditingSection] = useState<'summary' | `keyPoint-${number}` | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setEditableReport(report);
  }, [report]);

  const handleEditClick = (section: 'summary' | `keyPoint-${number}`, content: string) => {
    setEditingSection(section);
    setEditContent(content);
  };

  const handleSaveClick = () => {
    if (!editingSection) return;

    let updatedReport: ConciseReport;

    if (editingSection === 'summary') {
      updatedReport = { ...editableReport, summary: editContent };
    } else {
      const index = parseInt(editingSection.split('-')[1]);
      const newKeyPoints = [...editableReport.keyPoints];
      newKeyPoints[index] = editContent;
      updatedReport = { ...editableReport, keyPoints: newKeyPoints };
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
        <CardTitle>Concise Report</CardTitle>
        <CardDescription>A brief summary and key takeaways about "{topic}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Summary</h3>
            {editingSection !== 'summary' && (
              <Button variant="outline" size="sm" onClick={() => handleEditClick('summary', editableReport.summary)}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </Button>
            )}
          </div>
          {editingSection === 'summary' ? (
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] text-base leading-relaxed rounded-lg"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancelClick}><X className="mr-2 h-4 w-4" />Cancel</Button>
                <Button size="sm" onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" />Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{editableReport.summary}</p>
          )}
        </div>

        <Separator />

        {/* Key Points Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Key Points</h3>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            {editableReport.keyPoints.map((point, index) => {
              const sectionId = `keyPoint-${index}` as const;
              return (
                <li key={index} className="flex items-start">
                  {editingSection === sectionId ? (
                    <div className="space-y-4 ml-[-1.5rem] mt-4 w-full">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="text-base leading-relaxed rounded-lg"
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={handleCancelClick}><X className="mr-2 h-4 w-4" />Cancel</Button>
                            <Button size="sm" onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" />Save</Button>
                        </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start group w-full">
                        <span className="flex-1">{point}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => handleEditClick(sectionId, point)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </>
  );
}
