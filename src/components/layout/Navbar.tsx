
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare,
  Shield,
  LayoutDashboard,
  School,
  GraduationCap,
  ClipboardList,
  UserCog,
  Bell,
  Building,
  UserCheck,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Navbar = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCourseRep, setIsCourseRep] = useState(false);
  const [mobileMenuSections, setMobileMenuSections] = useState({
    userPages: false,
    courseRep: false,
    admin: false
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (user && userProfile) {
        try {
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) throw error;

          const roles = userRoles?.map(r => r.role) || [];
          setIsAdmin(roles.includes('admin'));
          setIsCourseRep(roles.includes('course_rep'));
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      }
    };

    checkUserRole();
  }, [user, userProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const publicNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Tools', href: '/tools' },
    { name: 'Events', href: '/events' },
    { name: 'Blogs', href: '/blogs' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMobileSection = (section: keyof typeof mobileMenuSections) => {
    setMobileMenuSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/a34f47d0-282f-46f8-81d5-70c52d2809b3.png" 
              alt="COOU Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-blue-700 hidden sm:block">
              COOU Updates
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Public Navigation */}
            {publicNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {user && !loading ? (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {userProfile?.full_name ? getInitials(userProfile.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {userProfile?.full_name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>User Pages</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/timetable" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Timetable
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/course-updates" className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Course Updates
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/exam-updates" className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Exam Updates
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/community" className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Community
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/resources" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Resources
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/lost-and-found" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Lost & Found
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/tools" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Tools
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>

                    {/* Course Rep Section */}
                    {isCourseRep && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Course Rep</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/lectures" className="flex items-center">
                            <School className="h-4 w-4 mr-2" />
                            Lecture Management
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/timetables" className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Timetable Management
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Admin Menu */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <FileText className="h-4 w-4 mr-2" />
                          Content Management
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/blogs">Blog Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/events">Event Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/alerts">Alert Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/messages">Messages</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <School className="h-4 w-4 mr-2" />
                          Academic Management
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/lectures">Lecture Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/exams">Exam Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/timetables">Timetable Management</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Building className="h-4 w-4 mr-2" />
                          Institution Management
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/faculties">Faculty Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/departments">Department Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/users">User Management</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/roles">Role Management</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics" className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics & Reports
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/moderator" className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Moderator Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/settings" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          System Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <Collapsible open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <CollapsibleContent className="lg:hidden pb-4 border-t">
            {/* Public Navigation */}
            <div className="py-4 space-y-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-blue-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {userProfile?.full_name ? getInitials(userProfile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {userProfile?.full_name || 'User'}
                  </span>
                </div>

                {/* User Navigation */}
                <Collapsible
                  open={mobileMenuSections.userPages}
                  onOpenChange={() => toggleMobileSection('userPages')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User Pages
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenuSections.userPages ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-4">
                    <Link to="/dashboard" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/timetable" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <Calendar className="h-4 w-4" />
                      <span>Timetable</span>
                    </Link>
                    <Link to="/course-updates" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <BookOpen className="h-4 w-4" />
                      <span>Course Updates</span>
                    </Link>
                    <Link to="/exam-updates" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <ClipboardList className="h-4 w-4" />
                      <span>Exam Updates</span>
                    </Link>
                    <Link to="/community" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <Users className="h-4 w-4" />
                      <span>Community</span>
                    </Link>
                    <Link to="/resources" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <FileText className="h-4 w-4" />
                      <span>Resources</span>
                    </Link>
                    <Link to="/messages" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                    <Link to="/lost-and-found" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <FileText className="h-4 w-4" />
                      <span>Lost & Found</span>
                    </Link>
                    <Link to="/tools" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="h-4 w-4" />
                      <span>Tools</span>
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                {/* Course Rep Section */}
                {isCourseRep && (
                  <Collapsible
                    open={mobileMenuSections.courseRep}
                    onOpenChange={() => toggleMobileSection('courseRep')}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-2 mt-2">
                        <span className="flex items-center">
                          <School className="h-4 w-4 mr-2" />
                          Course Rep
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenuSections.courseRep ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4">
                      <Link to="/admin/lectures" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <School className="h-4 w-4" />
                        <span>Lecture Management</span>
                      </Link>
                      <Link to="/admin/timetables" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Calendar className="h-4 w-4" />
                        <span>Timetable Management</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Admin Section */}
                {isAdmin && (
                  <Collapsible
                    open={mobileMenuSections.admin}
                    onOpenChange={() => toggleMobileSection('admin')}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-2 mt-2">
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenuSections.admin ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4">
                      <Link to="/admin" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link to="/admin/blogs" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <FileText className="h-4 w-4" />
                        <span>Blog Management</span>
                      </Link>
                      <Link to="/admin/events" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Calendar className="h-4 w-4" />
                        <span>Event Management</span>
                      </Link>
                      <Link to="/admin/alerts" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Bell className="h-4 w-4" />
                        <span>Alert Management</span>
                      </Link>
                      <Link to="/admin/messages" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                      <Link to="/admin/lectures" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <School className="h-4 w-4" />
                        <span>Lecture Management</span>
                      </Link>
                      <Link to="/admin/exams" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <ClipboardList className="h-4 w-4" />
                        <span>Exam Management</span>
                      </Link>
                      <Link to="/admin/faculties" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Building className="h-4 w-4" />
                        <span>Faculty Management</span>
                      </Link>
                      <Link to="/admin/departments" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Building className="h-4 w-4" />
                        <span>Department Management</span>
                      </Link>
                      <Link to="/admin/users" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <UserCog className="h-4 w-4" />
                        <span>User Management</span>
                      </Link>
                      <Link to="/admin/roles" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <UserCheck className="h-4 w-4" />
                        <span>Role Management</span>
                      </Link>
                      <Link to="/admin/analytics" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics & Reports</span>
                      </Link>
                      <Link to="/admin/settings" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-4 w-4" />
                        <span>System Settings</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-700 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </nav>
  );
};

export default Navbar;
