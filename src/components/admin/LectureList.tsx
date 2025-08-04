
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { LectureCard } from './LectureCard';
import { Lecture } from '@/types/lecture';

interface LectureListProps {
  lectures: Lecture[];
  loading: boolean;
  onEdit: (lecture: Lecture) => void;
  onDelete: (id: number) => void;
}

export const LectureList: React.FC<LectureListProps> = ({ lectures, loading, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Lectures</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && lectures.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lectures...</p>
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Lectures Found</h3>
            <p className="text-gray-600">Get started by adding your first lecture.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map(lecture => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
