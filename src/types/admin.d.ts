
export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  level?: number;
  campus?: string;
  faculty?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  link?: string;
  target_audience?: string[];
  created_by?: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_type: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  department_id: string;
  credit_units: number;
  level: number;
  semester: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminExam {
  id: string;
  course_code: string;
  course_title: string;
  exam_date: string;
  exam_time: string;
  venue: string;
  department: string;
  level: number;
  exam_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminFaculty {
  id: string;
  name: string;
  description?: string;
  campus?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminDepartment {
  id: string;
  name: string;
  description?: string;
  faculty_id: string;
  campus?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface AdminStats {
  users: number;
  blogPosts: number;
  events: number;
  courses: number;
  messages: number;
  faculties: number;
  departments: number;
  roles: number;
}

export interface AdminTableFilters {
  search: string;
  status?: string;
  type?: string;
  level?: number;
  department?: string;
  faculty?: string;
}

export interface AdminTablePagination {
  page: number;
  pageSize: number;
  total: number;
}
