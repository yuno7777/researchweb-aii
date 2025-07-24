
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function FeedbackForm() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      // In a real application, you would send this feedback to a server.
      // For this example, we'll just show a toast notification.
      console.log('Feedback submitted:', feedback);

      toast({
        title: 'Feedback Received!',
        description: "Thank you for helping us improve Insight Forge.",
      });
      setFeedback('');
    } else {
        toast({
            variant: 'destructive',
            title: 'Empty Feedback',
            description: "Please write something before submitting.",
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <Card>
            <CardContent className="p-6">
                <div className="grid w-full gap-4">
                    <Label htmlFor="feedback-message" className="sr-only">Your Feedback</Label>
                    <Textarea
                        id="feedback-message"
                        placeholder="Type your feedback here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={5}
                        className="text-base"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end p-6 pt-0">
                <Button type="submit" className="rounded-full">Submit Feedback</Button>
            </CardFooter>
        </Card>
    </form>
  );
}
