
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
  const [editingSection, setEditingSection] = useState<'summary' | 'keyPoints' | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setEditableReport(report);
  }, [report]);

  const handleEditClick = (section: 'summary' | 'keyPoints') => {
    setEditingSection(section);
    if (section === 'summary') {
      setEditContent(editableReport.summary);
    } else {
      setEditContent(editableReport.keyPoints.join('\n'));
    }
  };

  const handleSaveClick = () => {
    if (!editingSection) return;

    let updatedReport: ConciseReport;

    if (editingSection === 'summary') {
      updatedReport = { ...editableReport, summary: editContent };
    } else {
      const newKeyPoints = editContent.split('\n').filter(point => point.trim() !== '');
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
              <Button variant="outline" size="sm" onClick={() => handleEditClick('summary')}>
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
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Key Points</h3>
             {editingSection !== 'keyPoints' && (
              <Button variant="outline" size="sm" onClick={() => handleEditClick('keyPoints')}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </Button>
            )}
          </div>
          {editingSection === 'keyPoints' ? (
             <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[250px] text-base leading-relaxed rounded-lg"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancelClick}><X className="mr-2 h-4 w-4" />Cancel</Button>
                <Button size="sm" onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" />Save</Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3 list-disc list-inside text-muted-foreground">
              {editableReport.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-1">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </>
  );
}
