import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load components for better performance
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const About = React.lazy(() => import('@/pages/About'));
const Courses = React.lazy(() => import('@/pages/Courses'));
const Events = React.lazy(() => import('@/pages/Events'));
const Blogs = React.lazy(() => import('@/pages/Blogs'));
const PublicBlogs = React.lazy(() => import('@/pages/PublicBlogs'));
const BlogDetail = React.lazy(() => import('@/pages/BlogDetail'));
const Timetable = React.lazy(() => import('@/pages/Timetable'));
const LectureUpdates = React.lazy(() => import('@/pages/LectureUpdates'));
const CourseUpdates = React.lazy(() => import('@/pages/CourseUpdates'));
const ExamUpdates = React.lazy(() => import('@/pages/ExamUpdates'));
const Community = React.lazy(() => import('@/pages/Community'));
const Resources = React.lazy(() => import('@/pages/Resources'));
const AnonymousMessage = React.lazy(() => import('@/pages/AnonymousMessage'));
const AnonymousSubmission = React.lazy(() => import('@/pages/AnonymousSubmission'));
const LostAndFound = React.lazy(() => import('@/pages/LostAndFound'));
const Messages = React.lazy(() => import('@/pages/Messages'));
const TicketPayments = React.lazy(() => import('@/pages/TicketPayments'));
const PaymentStatus = React.lazy(() => import('@/pages/PaymentStatus'));
const ResumeBuilder = React.lazy(() => import('@/pages/ResumeBuilder'));
const Tools = React.lazy(() => import('@/pages/Tools'));
const UserSettings = React.lazy(() => import('@/pages/UserSettings'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));
const Departments = React.lazy(() => import('@/pages/Departments'));
const Wallet = React.lazy(() => import('@/pages/Wallet'));
const FundWallet = React.lazy(() => import('@/pages/FundWallet'));
const TicketRecovery = React.lazy(() => import('@/pages/TicketRecovery'));
const UserProfile = React.lazy(() => import('@/pages/UserProfile'));

// Admin Pages

const AdminRecovery = React.lazy(() => import('@/pages/AdminRecovery'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));

const UserManagement = React.lazy(() => import('@/pages/admin/UserManagement'));
const BlogManagement = React.lazy(() => import('@/pages/admin/BlogManagement'));
const EventManagement = React.lazy(() => import('@/pages/admin/EventManagement'));
const LectureManagement = React.lazy(() => import('@/pages/admin/LectureManagement'));
const TimetableManagement = React.lazy(() => import('@/pages/admin/TimetableManagement'));
const ExamManagement = React.lazy(() => import('@/pages/admin/ExamManagement'));
const CommunityManagement = React.lazy(() => import('@/pages/admin/CommunityManagement'));
const FacultyManagement = React.lazy(() => import('@/pages/admin/FacultyManagement'));
const DepartmentManagement = React.lazy(() => import('@/pages/admin/DepartmentManagement'));
const AlertManagement = React.lazy(() => import('@/pages/admin/AlertManagement'));
const SystemSettings = React.lazy(() => import('@/pages/admin/SystemSettings'));
const Analytics = React.lazy(() => import('@/pages/admin/Analytics'));
const AdminMessages = React.lazy(() => import('@/pages/admin/Messages'));

// Add new lazy loading for missing admin pages
const SystemReports = React.lazy(() => import('@/pages/admin/SystemReports'));
const ModeratorDashboard = React.lazy(() => import('@/pages/admin/ModeratorDashboard'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/events" element={<Events />} />
          <Route path="/blogs" element={<PublicBlogs />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/anonymous-message" element={<AnonymousMessage />} />
          <Route path="/anonymous/:linkId" element={<AnonymousSubmission />} />
          <Route path="/ticket-payments" element={<TicketPayments />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected User Routes */}
          {user && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user-blogs" element={<Blogs />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/lecture-updates" element={<LectureUpdates />} />
              <Route path="/course-updates" element={<CourseUpdates />} />
              <Route path="/exam-updates" element={<ExamUpdates />} />
              <Route path="/community" element={<Community />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/lost-and-found" element={<LostAndFound />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/user-settings" element={<UserSettings />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet/fund" element={<FundWallet />} />
              <Route path="/ticket-recovery" element={<TicketRecovery />} />
              <Route path="/user/:userId" element={<UserProfile />} />
            </>
          )}

          {/* Admin Routes */}
          
          <Route path="/admin-recovery" element={<AdminRecovery />} />
          {/* Route: /admin should always redirect to system dashboard if hit */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/blogs" element={<BlogManagement />} />
          <Route path="/admin/events" element={<EventManagement />} />
          <Route path="/admin/lectures" element={<LectureManagement />} />
          <Route path="/admin/timetables" element={<TimetableManagement />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/exams" element={<ExamManagement />} />
          <Route path="/admin/community" element={<CommunityManagement />} />
          <Route path="/admin/faculties" element={<FacultyManagement />} />
          <Route path="/admin/alerts" element={<AlertManagement />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings/*" element={<SystemSettings />} />
          <Route path="/admin/reports" element={<SystemReports />} />
          <Route path="/admin/moderator" element={<ModeratorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
};

export default AppRoutes;
