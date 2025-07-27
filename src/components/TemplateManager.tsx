
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save } from 'lucide-react';
import { Separator } from './ui/separator';

export interface Template {
  id: string;
  name: string;
  sections: string[];
}

interface TemplateManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
}

export function TemplateManager({ isOpen, onOpenChange, templates, setTemplates }: TemplateManagerProps) {
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSections, setNewTemplateSections] = useState<string[]>(['']);

  const handleAddTemplate = () => {
    if (newTemplateName.trim() === '') return;
    
    const finalSections = newTemplateSections.map(s => s.trim()).filter(s => s !== '');
    if (finalSections.length === 0) return;

    const newTemplate: Template = {
      id: `tpl_${Date.now()}`,
      name: newTemplateName.trim(),
      sections: finalSections,
    };
    setTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateSections(['']);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };
  
  const handleSectionChange = (index: number, value: string) => {
    const updatedSections = [...newTemplateSections];
    updatedSections[index] = value;
    setNewTemplateSections(updatedSections);
  };
  
  const handleAddSectionField = () => {
    setNewTemplateSections([...newTemplateSections, '']);
  }
  
  const handleRemoveSectionField = (index: number) => {
    const updatedSections = newTemplateSections.filter((_, i) => i !== index);
    setNewTemplateSections(updatedSections);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Report Templates</DialogTitle>
          <DialogDescription>
            Create, edit, or delete your custom report templates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
            {/* List Existing Templates */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Templates</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {templates.length === 0 && <p className="text-sm text-muted-foreground">You haven't created any templates yet.</p>}
                    {templates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                            <p className="font-semibold">{template.name}</p>
                            <p className="text-sm text-muted-foreground">{template.sections.join(', ')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Create New Template */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New Template</h3>
                <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Market Analysis"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Sections</Label>
                    {newTemplateSections.map((section, index) => (
                         <div key={index} className="flex items-center gap-2">
                            <Input
                                value={section}
                                onChange={(e) => handleSectionChange(index, e.target.value)}
                                placeholder={`Section ${index + 1}`}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSectionField(index)} disabled={newTemplateSections.length <= 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddSectionField}>
                        <Plus className="mr-2 h-4 w-4" />Add Section
                    </Button>
                </div>
            </div>
        </div>

        <DialogFooter>
            <Button onClick={handleAddTemplate}><Save className="mr-2 h-4 w-4"/>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

