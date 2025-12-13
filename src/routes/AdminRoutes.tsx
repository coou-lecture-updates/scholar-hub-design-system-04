import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import Analytics from '@/pages/admin/Analytics';
import EnhancedAnalytics from '@/pages/admin/EnhancedAnalytics';
import TimetableManagement from '@/pages/admin/TimetableManagement';
import DepartmentManagement from '@/pages/admin/DepartmentManagement';
import FacultyManagement from '@/pages/admin/FacultyManagement';
import LectureManagement from '@/pages/admin/LectureManagement';
import ExamManagement from '@/pages/admin/ExamManagement';
import EventManagement from '@/pages/admin/EventManagement';
import BlogManagement from '@/pages/admin/BlogManagement';
import AlertManagement from '@/pages/admin/AlertManagement';
import CommunityManagement from '@/pages/admin/CommunityManagement';
import SystemReports from '@/pages/admin/SystemReports';
import SystemSettings from '@/pages/admin/SystemSettings';
import Messages from '@/pages/admin/Messages';
import RoleManagement from '@/pages/admin/RoleManagement';
import ModeratorDashboard from '@/pages/admin/ModeratorDashboard';
import AdManagement from '@/pages/admin/AdManagement';
import TransactionManagement from '@/pages/admin/TransactionManagement';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="moderator" element={<ModeratorDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="enhanced-analytics" element={<EnhancedAnalytics />} />
      <Route path="timetables" element={<TimetableManagement />} />
      <Route path="departments" element={<DepartmentManagement />} />
      <Route path="faculties" element={<FacultyManagement />} />
      <Route path="lectures" element={<LectureManagement />} />
      <Route path="exams" element={<ExamManagement />} />
      <Route path="events" element={<EventManagement />} />
      <Route path="blogs" element={<BlogManagement />} />
      <Route path="alerts" element={<AlertManagement />} />
      <Route path="community" element={<CommunityManagement />} />
      <Route path="reports" element={<SystemReports />} />
      <Route path="settings/*" element={<SystemSettings />} />
      <Route path="messages" element={<Messages />} />
      <Route path="roles" element={<RoleManagement />} />
      <Route path="ads" element={<AdManagement />} />
      <Route path="transactions" element={<TransactionManagement />} />
    </Routes>
  );
};

export default AdminRoutes;