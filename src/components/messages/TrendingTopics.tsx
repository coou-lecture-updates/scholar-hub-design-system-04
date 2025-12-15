import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingTopicsProps {
  topics: { name: string; count: number }[];
  selectedTopic: string;
  onTopicSelect: (topic: string) => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  topics,
  selectedTopic,
  onTopicSelect,
}) => {
  if (topics.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Trending Topics</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topics.slice(0, 8).map((topic) => (
          <button
            key={topic.name}
            onClick={() => onTopicSelect(selectedTopic === topic.name ? 'all' : topic.name)}
            className="group"
          >
            <Badge
              variant={selectedTopic === topic.name ? "default" : "secondary"}
              className={cn(
                "gap-1 cursor-pointer transition-all hover:scale-105",
                selectedTopic === topic.name 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-accent/50 hover:bg-accent"
              )}
            >
              <Hash className="h-3 w-3" />
              {topic.name}
              <span className="text-xs opacity-70">({topic.count})</span>
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
};
