
export type AppRole = 'admin' | 'moderator' | 'course_rep' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  faculty_id?: string;
  department_id?: string;
  level?: number;
  created_at: string;
  users?: {
    id: string;
    email: string;
    full_name?: string;
  };
  faculties?: {
    id: string;
    name: string;
  };
  departments?: {
    id: string;
    name: string;
  };
}
