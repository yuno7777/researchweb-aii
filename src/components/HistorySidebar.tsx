'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Trash2 } from "lucide-react";

interface HistorySidebarProps {
  history: string[];
  onSelectTopic: (topic: string) => void;
  onClearHistory: () => void;
}

export function HistorySidebar({ history, onSelectTopic, onClearHistory }: HistorySidebarProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <HistoryIcon className="w-5 h-5" />
          Query History
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">No history yet. Generate a report to see it here.</p>
          ) : (
            history.map((topic, index) => (
              <Button
                key={`${topic}-${index}`}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-2"
                onClick={() => onSelectTopic(topic)}
              >
                <span className="truncate">{topic}</span>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
      {history.length > 0 && (
        <div className="p-2 border-t mt-auto">
          <Button variant="outline" className="w-full" onClick={onClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}
