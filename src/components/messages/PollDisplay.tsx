import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface PollOption {
  id: string;
  option_text: string;
  votes_count: number;
}

interface Poll {
  id: string;
  message_id: string;
  question: string;
  expires_at: string;
}

interface PollDisplayProps {
  pollId: string;
}

export const PollDisplay: React.FC<PollDisplayProps> = ({ pollId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('message_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;
      setPoll(pollData);

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId);

      if (optionsError) throw optionsError;
      setOptions(optionsData || []);

      // Check if user has voted
      if (user) {
        const { data: voteData } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .single();

        if (voteData) {
          setUserVote(voteData.option_id);
        }
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to vote',
        variant: 'destructive',
      });
      return;
    }

    if (userVote) {
      toast({
        title: 'Already voted',
        description: 'You have already voted on this poll',
        variant: 'destructive',
      });
      return;
    }

    const isExpired = poll && new Date(poll.expires_at) < new Date();
    if (isExpired) {
      toast({
        title: 'Poll closed',
        description: 'This poll has expired',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);

      const { error } = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
      });

      if (error) throw error;

      // Update local state
      setUserVote(optionId);
      setOptions(
        options.map((opt) =>
          opt.id === optionId
            ? { ...opt, votes_count: opt.votes_count + 1 }
            : opt
        )
      );

      toast({
        title: 'Vote recorded',
        description: 'Your vote has been submitted',
      });
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes_count, 0);
  const isExpired = new Date(poll.expires_at) < new Date();
  const hasVoted = !!userVote;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{poll.question}</CardTitle>
          <Badge variant={isExpired ? 'secondary' : 'default'} className="ml-2">
            {isExpired ? 'Closed' : 'Active'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {isExpired
            ? 'Poll ended'
            : `Ends ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? (option.votes_count / totalVotes) * 100 : 0;
          const isSelected = userVote === option.id;

          return (
            <div key={option.id} className="space-y-1">
              {hasVoted || isExpired ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                      {option.option_text}
                    </span>
                    <span className="text-muted-foreground">
                      {percentage.toFixed(0)}% ({option.votes_count})
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleVote(option.id)}
                  disabled={voting}
                >
                  {option.option_text}
                </Button>
              )}
            </div>
          );
        })}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
        </div>
      </CardContent>
    </Card>
  );
};
