
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  campus?: string;
}

interface Faculty {
  id: string;
  name: string;
  campus?: string;
  departments: Department[];
}

interface FacultyContentProps {
  faculties: Faculty[];
  activeCampus: string;
}

const FacultyContent = ({ faculties, activeCampus }: FacultyContentProps) => {
  return (
    <>
      {faculties.map(faculty => (
        <TabsContent key={faculty.id} value={faculty.id} className="p-4 md:p-6 bg-gray-50 rounded-lg animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-0">{faculty.name}</h3>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {activeCampus} Campus
            </Badge>
          </div>
          
          {faculty.departments && faculty.departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {faculty.departments.map(department => (
                <Card key={department.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <span className="text-gray-800">{department.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No departments listed for this faculty.</p>
          )}
        </TabsContent>
      ))}
    </>
  );
};

export default FacultyContent;
