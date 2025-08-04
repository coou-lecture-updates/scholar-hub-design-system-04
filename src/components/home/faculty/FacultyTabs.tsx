
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Faculty {
  id: string;
  name: string;
  campus?: string;
}

interface FacultyTabsProps {
  faculties: Faculty[];
  activeTab: string | null;
  onTabChange: (value: string) => void;
}

const FacultyTabs = ({ faculties, activeTab, onTabChange }: FacultyTabsProps) => {
  return (
    <div className="mb-6 w-full">
      <ScrollArea className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1 w-max min-w-full">
          {faculties.map(faculty => (
            <TabsTrigger 
              key={faculty.id} 
              value={faculty.id} 
              className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 text-sm font-medium rounded-md mx-1 hover:bg-gray-200 data-[state=active]:hover:bg-blue-700 transition-colors"
            >
              {faculty.name.replace('Faculty of ', '')}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default FacultyTabs;
