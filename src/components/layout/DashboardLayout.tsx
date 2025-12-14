import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Calendar, User, MessageSquare, Bell, Search, FileText, 
  PenTool, Layers, Settings, LogOut, Menu, X, ChevronDown, Building2,
  BarChart3, FileSpreadsheet, Megaphone, CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import SidebarMenu from '@/components/ui/sidebar-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu as NewSidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'student' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = 'student' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();
  const isMobile = useIsMobile();
  
  const userRole = userProfile?.role || 'user';
  const isAdmin = userRole === 'admin';
  
  React.useEffect(() => {
    if (role === 'admin' && !isAdmin) {
      navigate('/dashboard');
    } else if (role === 'student' && isAdmin) {
      navigate('/admin-dashboard');
    }
  }, [role, isAdmin, navigate]);
  
  // Updated student nav: removed Analytics, added Blogs above Tools
  const studentNavItems = [
    { name: 'Dashboard', icon: <Layers size={20} />, path: '/dashboard' },
    { name: 'Timetable', icon: <Calendar size={20} />, path: '/timetable' },
    { name: 'Course Updates', icon: <BookOpen size={20} />, path: '/course-updates' },
    { name: 'Exam Updates', icon: <FileText size={20} />, path: '/exam-updates' },
    { name: 'Events', icon: <Calendar size={20} />, path: '/events' },
    { name: 'Lost & Found', icon: <Search size={20} />, path: '/lost-and-found' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Resume Builder', icon: <PenTool size={20} />, path: '/resume-builder' },
    { name: 'Blogs', icon: <FileText size={20} />, path: '/blogs' },
    { name: 'Tools', icon: <Settings size={20} />, path: '/tools' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/user-settings' },
  ];

  // Admin nav items with Ads and Transactions
  const adminNavItems = [
    { name: 'Dashboard', icon: <Layers size={20} />, path: '/admin-dashboard' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
    { name: 'User Management', icon: <User size={20} />, path: '/admin/users' },
    { name: 'Timetable Management', icon: <Calendar size={20} />, path: '/admin/timetables' },
    { name: 'Department Management', icon: <Building2 size={20} />, path: '/admin/departments' },
    { name: 'Faculty Management', icon: <BookOpen size={20} />, path: '/admin/faculties' },
    { name: 'Lecture Management', icon: <BookOpen size={20} />, path: '/admin/lectures' },
    { name: 'Exam Management', icon: <FileText size={20} />, path: '/admin/exams' },
    { name: 'Event Management', icon: <Calendar size={20} />, path: '/admin/events' },
    { name: 'Blog Management', icon: <PenTool size={20} />, path: '/admin/blogs' },
    { name: 'Ad Management', icon: <Megaphone size={20} />, path: '/admin/ads' },
    { name: 'Transactions', icon: <CreditCard size={20} />, path: '/admin/transactions' },
    { name: 'Send Alerts', icon: <Bell size={20} />, path: '/admin/alerts' },
    { name: 'Community Management', icon: <MessageSquare size={20} />, path: '/admin/community' },
    { name: 'System Reports', icon: <FileSpreadsheet size={20} />, path: '/admin/reports' },
    { name: 'System Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];
  
  const navItems = role === 'admin' ? adminNavItems : studentNavItems;

  // Bottom nav for student: Dashboard, Timetable, Events, Messages, Settings only
  const mobileStudentNavItems = [
    { name: 'Dashboard', icon: <Layers size={18} />, path: '/dashboard' },
    { name: 'Timetable', icon: <Calendar size={18} />, path: '/timetable' },
    { name: 'Events', icon: <Calendar size={18} />, path: '/events' },
    { name: 'Messages', icon: <MessageSquare size={18} />, path: '/messages' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/user-settings' }
  ];

  const mobileAdminNavItems = [
    { name: 'Dashboard', icon: <Layers size={18} />, path: '/admin-dashboard' },
    { name: 'Analytics', icon: <BarChart3 size={18} />, path: '/admin/analytics' },
    { name: 'Users', icon: <User size={18} />, path: '/admin/users' },
    { name: 'Alerts', icon: <Bell size={18} />, path: '/admin/alerts' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' }
  ];

  const mobileNavItems = role === 'admin' ? mobileAdminNavItems : mobileStudentNavItems;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Link to="/" className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">C</span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    COOU Updates
                  </span>
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <NewSidebarMenu className="mt-3 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                  {navItems.map(item => (
                    <SidebarMenuItem key={item.path} className="my-1">
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                      >
                        <Link to={item.path} className={
                          `flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                            location.pathname === item.path
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`
                        }>
                          {item.icon}
                          <span className="ml-3 text-sm font-medium">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </NewSidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t border-border bg-background">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm text-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </Sidebar>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          <header className="bg-card shadow-sm border-b border-border">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold text-foreground">
                  {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  onClick={() => navigate(role === 'admin' ? '/admin/alerts' : '/messages')}
                >
                  <Bell size={20} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-1 rounded-full">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-md">
                        {role === 'admin' ? 'A' : userProfile?.full_name?.charAt(0) || 'S'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {userProfile?.full_name || (role === 'admin' ? 'Admin User' : 'Student')}
                      <p className="text-xs text-muted-foreground">{userProfile?.email || 'user@example.com'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(role === 'admin' ? '/admin/settings' : '/user-settings')}>
                      <Settings size={16} className="mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(role === 'admin' ? '/admin/messages' : '/messages')}>
                      <MessageSquare size={16} className="mr-2" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className={`flex-1 overflow-y-auto bg-background ${
            location.pathname === '/messages' ? 'p-0 md:p-6' : 'p-4 md:p-6'
          } pb-20 md:pb-6`}>
            {children}
          </main>

          {/* Mobile Nav - Only allowed 5 items: Dashboard, Timetable, Events, Messages, Settings */}
          <div className="md:hidden w-full fixed bottom-0 bg-card border-t border-border z-20 shadow-lg">
            <div className="grid grid-cols-5 overflow-x-auto">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center py-2 px-1 hover:scale-105 transition-transform"
                >
                  <div className={`p-1 rounded-md mb-1 ${location.pathname === item.path ? 'bg-primary/10' : ''}`}>
                    <div className={location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={`${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'} text-xs truncate max-w-full text-center`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
