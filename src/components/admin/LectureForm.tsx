import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { COLORS, DAYS, LEVELS, SEMESTERS } from '@/types/lecture';
import { useFaculties } from '@/hooks/useFaculties';
import { useDepartments } from '@/hooks/useDepartments';
import { useLecturers } from '@/hooks/useLecturers';

interface LectureFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  editingLecture: any;
  loading: boolean;
  onInputChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
}

export const LectureForm: React.FC<LectureFormDialogProps> = ({
  open,
  onClose,
  formData,
  editingLecture,
  loading,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  // Campus static options
  const campusOptions = ['Uli', 'Igbariam'];

  const { data: faculties = [], isLoading: facultiesLoading } = useFaculties();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments(formData.faculty);
  const { data: lecturers = [], isLoading: lecturersLoading } = useLecturers();

  // For start_time and end_time
  useEffect(() => {
    if (editingLecture && !formData.start_time && !formData.end_time && formData.time) {
      const [start, end] = formData.time.split('-').map(x => x.trim());
      onInputChange('start_time', start || '');
      onInputChange('end_time', end || '');
    }
    // eslint-disable-next-line
  }, [editingLecture, formData.time]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="
          w-full
          max-w-sm
          md:max-w-md
          lg:max-w-lg
          !p-0
          rounded-2xl
          shadow-xl
          min-h-[60px]
          max-h-[78vh]
          animate-fade-in
          flex flex-col
          overflow-hidden
        "
        style={{
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <form onSubmit={onSubmit} className="flex-1 flex flex-col">
          <DialogTitle className="p-5 pb-0 text-base md:text-lg">
            {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
          </DialogTitle>
          <DialogDescription className="px-5 pb-2 text-xs md:text-sm">
            Please provide all details. All starred fields are required.
          </DialogDescription>
          <div
            className="
              flex-1
              overflow-y-auto
              px-5
              pt-3
              pb-2
              space-y-4
              scrollbar-thin
              scrollbar-thumb-muted
              scrollbar-track-transparent
              custom-scrollbar
            "
            style={{
              maxHeight: 'calc(72vh - 85px)',
              minHeight: '48px',
            }}
          >
            {/* Responsive grids -- collapse to 1-col on small screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={e => onInputChange('subject', e.target.value)}
                  required
                  placeholder="CSC 501: Advanced Algorithms"
                />
              </div>
              <div>
                <Label htmlFor="lecturer">Lecturer</Label>
                <Select
                  value={formData.lecturer}
                  onValueChange={value => onInputChange('lecturer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturersLoading && (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                    {lecturers
                      .filter((lecturer: string) => typeof lecturer === 'string' && lecturer.trim() !== '')
                      .map((lecturer: string) => (
                        <SelectItem key={lecturer} value={lecturer}>{lecturer}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">Day *</Label>
                <Select
                  value={formData.day}
                  onValueChange={value => onInputChange('day', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.slice(0, 5)
                      .filter(day => typeof day === 'string' && day.trim() !== '')
                      .map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room">Room *</Label>
                <Input
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={e => onInputChange('room', e.target.value)}
                  required
                  placeholder="Lab B"
                />
              </div>
            </div>
            {/* Start and End Time separated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  value={formData.start_time || ''}
                  onChange={e => onInputChange('start_time', e.target.value)}
                  type="time"
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  value={formData.end_time || ''}
                  onChange={e => onInputChange('end_time', e.target.value)}
                  type="time"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Background Color *</Label>
                <Select
                  value={formData.color}
                  onValueChange={value => onInputChange('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS
                      .filter(color => typeof color === 'string' && color.trim() !== '')
                      .map(color => (
                        <SelectItem key={color} value={color}>
                          <span className={`inline-block w-4 h-4 rounded mr-2 ${color}`} />
                          {color.replace('bg-', '').replace('-100', '')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={value => onInputChange('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS
                      .map(level => level.toString())
                      .filter(level => typeof level === 'string' && level.trim() !== '')
                      .map(level => (
                        <SelectItem key={level} value={level}>{level} Level</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="faculty">Faculty *</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={value => onInputChange('faculty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultiesLoading && (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                    {faculties
                      .filter((faculty: string) => typeof faculty === 'string' && faculty.trim() !== '')
                      .map((faculty: string) => (
                        <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={value => onInputChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading && (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                    {departments
                      .filter((dept: string) => typeof dept === 'string' && dept.trim() !== '')
                      .map((dept: string) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={value => onInputChange('semester', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS
                      .filter((semester: string) => typeof semester === 'string' && semester.trim() !== '')
                      .map(semester => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={e => onInputChange('academic_year', e.target.value)}
                  placeholder="2024/2025"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campus">Campus *</Label>
                <Select
                  value={formData.campus}
                  onValueChange={value => onInputChange('campus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campusOptions
                      .filter(campus => typeof campus === 'string' && campus.trim() !== '')
                      .map(campus => (
                        <SelectItem key={campus} value={campus}>{campus} Campus</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-5 pt-0">
            <Button type="button" variant="outline" onClick={onCancel ?? onClose} className="min-w-[90px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading
                ? (editingLecture ? 'Updating...' : 'Saving...')
                : (editingLecture ? 'Update' : 'Create') + ' Lecture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
