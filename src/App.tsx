
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './scripts/productionSetup';
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PublicBlogs from "./pages/PublicBlogs";
import BlogDetail from "./pages/BlogDetail";
import Community from "./pages/Community";
import LostAndFound from "./pages/LostAndFound";
import AnonymousMessage from "./pages/AnonymousMessage";
import AnonymousSubmission from "./pages/AnonymousSubmission";
import FundWallet from "./pages/FundWallet";
import Wallet from "./pages/Wallet";
import PaymentHistory from "./pages/PaymentHistory";
import TicketPayments from "./pages/TicketPayments";
import Events from "./pages/Events";
import Tools from "./pages/Tools";
import Timetable from "./pages/Timetable";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { ProtectedRoute, AdminRoute, HomeRedirect } from "@/components/AccessControl";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResumeBuilder from "./pages/ResumeBuilder";
import AdminLogin from "./pages/AdminLogin";
import UserSettings from "./pages/UserSettings";

import ExamManagement from "./pages/admin/ExamManagement";
import CommunityManagement from "./pages/admin/CommunityManagement";
import UserManagement from "./pages/admin/UserManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import EventManagement from "./pages/admin/EventManagement";
import TimetableManagement from "./pages/admin/TimetableManagement";
import LectureManagement from "./pages/admin/LectureManagement";
import AlertManagement from "./pages/admin/AlertManagement";
import SystemSettings from "./pages/admin/SystemSettings";

import FacultyManagement from "./pages/admin/FacultyManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import CourseUpdates from "./pages/CourseUpdates";
import ExamUpdates from "./pages/ExamUpdates";
import Messages from "./pages/Messages";
import Unauthorized from "./pages/Unauthorized";
import PaymentStatus from "./pages/PaymentStatus";
import TicketRecoveryPage from "./pages/TicketRecovery";
import Analytics from "./pages/admin/Analytics";
import SystemReportsPage from "./pages/admin/SystemReports";
import { NotificationProvider } from "@/components/ui/notifications";
import LovableBadge from '@/components/LovableBadge';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import SEOHeadManager from '@/components/seo/SEOHeadManager';
import Contact from "./pages/Contact";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Moved useAuth inside AppInner
import { useAuth } from "@/contexts/auth/useAuth";

const queryClient = new QueryClient();

function AppInner() {
  const { user, loading, userProfile } = useAuth(); // Safe to use now
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();
      // Only check value property if it exists
      setMaintenance(data?.value === 'true');
    }
    fetchStatus();

    const subscription = supabase
      .channel('config')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        (payload) => {
          // Only update state if the row has "maintenance_mode" key
          if (payload.new && typeof payload.new === 'object' && 'key' in payload.new && payload.new.key === "maintenance_mode") {
            setMaintenance((payload.new as any).value === 'true');
          }
        }
      )
      .subscribe();
    return () => {
      try { supabase.removeChannel(subscription); } catch {}
    };
  }, []);

  const path = window.location.pathname;
  const isAdminRoute = /^\/admin($|[-/])/.test(path);

  // Only admins (userProfile?.role === "admin") can access when maintenance is true
  if (maintenance && !isAdminRoute && (!user || userProfile?.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4">
        <div className="p-8 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center max-w-sm">
          <div className="w-12 h-12 text-blue-600 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2 text-blue-900">Maintenance Mode</h1>
          <p className="text-gray-700 mb-4 text-center">
            Our student portal is temporarily down for maintenance or updates.<br />
            We'll be back shortly! Please check again soon.
          </p>
          <p className="text-xs text-gray-400 mt-2">Only admins may access the portal right now.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/blogs" element={<PublicBlogs />} />
      <Route path="/blogs/:blogId" element={<BlogDetail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route path="/payment/redirect" element={<PaymentStatus />} />
      <Route path="/ticket-recovery" element={<TicketRecoveryPage />} />
      <Route path="/home-redirect" element={<HomeRedirect />} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* <Route path="/analytics" element={<ProtectedRoute><UserAnalytics /></ProtectedRoute>} /> */}
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/lost-and-found" element={<ProtectedRoute><LostAndFound /></ProtectedRoute>} />
      <Route path="/anonymous-message" element={<ProtectedRoute><AnonymousMessage /></ProtectedRoute>} />
      <Route path="/anonymous/:linkId" element={<AnonymousSubmission />} />
      <Route path="/fund-wallet" element={<ProtectedRoute><FundWallet /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
      <Route path="/ticket-payments" element={<ProtectedRoute><TicketPayments /></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
      <Route path="/user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      <Route path="/course-updates" element={<ProtectedRoute><CourseUpdates /></ProtectedRoute>} />
      <Route path="/exam-updates" element={<ProtectedRoute><ExamUpdates /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

      {/* Admin Routes */}
      
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* Add: /admin should redirect to /admin-dashboard */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><SystemReportsPage /></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><ExamManagement /></AdminRoute>} />
      <Route path="/admin/community" element={<AdminRoute><CommunityManagement /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/blogs" element={<AdminRoute><BlogManagement /></AdminRoute>} />
      <Route path="/admin/events" element={<AdminRoute><EventManagement /></AdminRoute>} />
      <Route path="/admin/timetables" element={<AdminRoute><TimetableManagement /></AdminRoute>} />
      <Route path="/admin/lectures" element={<AdminRoute><LectureManagement /></AdminRoute>} />
      <Route path="/admin/alerts" element={<AdminRoute><AlertManagement /></AdminRoute>} />
      <Route path="/admin/settings/*" element={<AdminRoute><SystemSettings /></AdminRoute>} />
      <Route path="/admin/faculties" element={<AdminRoute><FacultyManagement /></AdminRoute>} />
      <Route path="/admin/departments" element={<AdminRoute><DepartmentManagement /></AdminRoute>} />
      <Route path="/admin/messages" element={<AdminRoute><Messages /></AdminRoute>} />
      <Route path="/contact" element={<Contact />} />
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// The OUTER App ONLY sets up the Providers in the right order, then renders AppInner
function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <AppInner />
            <Toaster />
            <LovableBadge />
            <GoogleAnalytics />
            <SEOHeadManager />
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
