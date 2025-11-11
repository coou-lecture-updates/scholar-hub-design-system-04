import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Hash, Users, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  topics: string[];
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedRole,
  onRoleChange,
  sortBy,
  onSortByChange,
  topics,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || selectedTopic !== 'all' || selectedRole !== 'all' || sortBy !== 'recent';

  return (
    <div className="bg-accent/20 border border-border/50 rounded-xl p-3 md:p-4 space-y-3 md:space-y-4 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search discussions, topics, or members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 md:h-12 text-sm md:text-base bg-card border-border/50 focus:border-primary/50 rounded-lg"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Topic Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-sm bg-card hover:bg-accent/50 border-border/50">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Topic</span>
              {selectedTopic !== 'all' && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">Filter by Topic</h4>
              <Select value={selectedTopic} onValueChange={onTopicChange}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Role Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-sm bg-card hover:bg-accent/50 border-border/50">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Role</span>
              {selectedRole !== 'all' && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">Filter by Role</h4>
              <Select value={selectedRole} onValueChange={onRoleChange}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="course_rep">Course Reps</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-auto md:w-[150px] h-9 text-sm gap-2 bg-card border-border/50">
            <Clock className="h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 h-9 text-sm ml-auto hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
};
