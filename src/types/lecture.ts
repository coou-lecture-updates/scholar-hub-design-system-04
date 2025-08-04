
export interface Lecture {
  id: number;
  day: string;
  time: string;
  subject: string;
  room: string;
  lecturer?: string;
  level: number;
  faculty: string;
  department: string;
  campus: string;
  semester: string;
  academic_year: string;
  color: string;
}

export interface LectureFormData {
  day: string;
  time: string;
  subject: string;
  room: string;
  lecturer: string;
  level: string;
  faculty: string;
  department: string;
  campus: string;
  semester: string;
  academic_year: string;
  color: string;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const LEVELS = [100, 200, 300, 400, 500];
export const SEMESTERS = ['First Semester', 'Second Semester'];
export const COLORS = [
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-red-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100'
];
