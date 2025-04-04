import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Feedback } from '@/types';
import { getProjectFeedback } from '@/lib/feedback';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface FeedbackListProps {
  projectId: string;
}

export const FeedbackList = ({ projectId }: FeedbackListProps) => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const { feedback, error } = await getProjectFeedback(projectId);
      
      if (error) {
        throw error;
      }
      
      setFeedbackItems(feedback as Feedback[]);
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      setError(err.message || 'Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No feedback yet"
        description="Feedback will appear here when faculty provides it"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbackItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={item.faculty?.avatar_url || ''} alt="Faculty" />
                <AvatarFallback>{item.faculty?.name?.[0] || 'F'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{item.faculty?.name || 'Faculty'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(item.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-2 text-sm">{item.comment}</p>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
