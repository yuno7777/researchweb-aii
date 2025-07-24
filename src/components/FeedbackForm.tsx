
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { handleFeedbackSubmit } from '@/app/actions';

export function FeedbackForm() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim() && !isSubmitting) {
      setIsSubmitting(true);
      const result = await handleFeedbackSubmit(feedback);
      setIsSubmitting(false);

      if (result.success) {
        toast({
          title: 'Feedback Received!',
          description: "Thank you for helping us improve Insight Forge.",
        });
        setFeedback('');
      } else {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: result.error || "Something went wrong. Please try again.",
        });
      }
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
                        className="text-base resize-none"
                        disabled={isSubmitting}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end p-6 pt-0">
                <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
}
