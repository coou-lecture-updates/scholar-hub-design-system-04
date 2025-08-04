
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Lecture } from '@/types/lecture';
import RoleBasedAccess from '@/components/RoleBasedAccess';

interface LectureCardProps {
  lecture: Lecture;
  onEdit: (lecture: Lecture) => void;
  onDelete: (id: number) => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({ lecture, onEdit, onDelete }) => {
  return (
    <div className={`p-4 rounded-lg border ${lecture.color}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{lecture.subject}</h3>
        <RoleBasedAccess allowedRoles={['admin', 'course_rep']} fallback={null}>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(lecture)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(lecture.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </RoleBasedAccess>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{lecture.day}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{lecture.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{lecture.room}</span>
        </div>
        {lecture.lecturer && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{lecture.lecturer}</span>
          </div>
        )}
        <div className="text-xs text-gray-600 mt-2">
          <div>Level {lecture.level} • {lecture.department}</div>
          <div>{lecture.semester} • {lecture.academic_year}</div>
          <div>{lecture.campus} Campus</div>
        </div>
      </div>
    </div>
  );
};
