import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Calendar, Filter } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  priceFilter: string;
  onPriceFilterChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const eventTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
];

const priceFilters = [
  { value: 'all', label: 'All Prices' },
  { value: 'free', label: 'Free Only' },
  { value: 'paid', label: 'Paid Only' },
  { value: 'under1000', label: 'Under ₦1,000' },
  { value: 'under5000', label: 'Under ₦5,000' },
];

const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  eventType,
  onEventTypeChange,
  priceFilter,
  onPriceFilterChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  activeFiltersCount,
}) => {
  return (
    <div className="bg-card rounded-lg border border-border/50 p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Event Type Filter */}
        <Select value={eventType} onValueChange={onEventTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Filter */}
        <Select value={priceFilter} onValueChange={onPriceFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {priceFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Active filters:
          </span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <button onClick={() => onSearchChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {eventType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {eventTypes.find(t => t.value === eventType)?.label}
              <button onClick={() => onEventTypeChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Price: {priceFilters.find(f => f.value === priceFilter)?.label}
              <button onClick={() => onPriceFilterChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-destructive hover:text-destructive"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
