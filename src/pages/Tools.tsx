import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth/useAuth';
import { Calculator, Calendar, Clock, FileText, Pen, Wrench, GraduationCap, Users, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { NotificationProvider } from '@/components/ui/notifications';

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Available tools that actually exist in the system
  const availableTools = [
    {
      title: "Timetable Viewer",
      description: "View your personalized class timetable and schedules",
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      path: "/timetable",
      comingSoon: false,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Resume Builder",
      description: "Create professional resumes with our easy-to-use builder",
      icon: <FileText className="h-8 w-8 text-green-600" />,
      path: "/resume-builder",
      comingSoon: false,
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Lost & Found",
      description: "Report lost items or search for found items on campus",
      icon: <Pen className="h-8 w-8 text-purple-600" />,
      path: "/lost-and-found",
      comingSoon: false,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Community Hub",
      description: "Connect with fellow students and join discussions",
      icon: <Users className="h-8 w-8 text-orange-600" />,
      path: "/community",
      comingSoon: false,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Course Updates",
      description: "Stay updated with the latest course information and materials",
      icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
      path: "/course-updates",
      comingSoon: false,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      title: "Anonymous Messages",
      description: "Send anonymous messages securely and privately",
      icon: <Pen className="h-8 w-8 text-pink-600" />,
      path: "/anonymous-message",
      comingSoon: false,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "GPA Calculator",
      description: "Calculate your Grade Point Average easily and accurately",
      icon: <Calculator className="h-8 w-8 text-red-600" />,
      path: "/tools/gpa-calculator",
      comingSoon: true,
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      title: "Study Planner",
      description: "Plan your study schedule and track your progress",
      icon: <Clock className="h-8 w-8 text-yellow-600" />,
      path: "/tools/study-planner",
      comingSoon: true,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "Academic Calendar",
      description: "View important academic dates and deadlines",
      icon: <GraduationCap className="h-8 w-8 text-teal-600" />,
      path: "/tools/academic-calendar",
      comingSoon: true,
      bgColor: "bg-teal-50",
      textColor: "text-teal-600"
    }
  ];

  // Redirect to login page if user is not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/tools' } });
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NotificationProvider>
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-10">
            {/* Header Section */}
            <div className="text-center max-w-4xl mx-auto mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Wrench className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Student Tools</h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Access powerful tools and resources designed to enhance your academic experience at COOU
              </p>
            </div>
            
            {/* Tools Grid */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableTools.map((tool, index) => (
                  <Card 
                    key={index} 
                    className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md ${
                      tool.comingSoon ? 'opacity-75' : 'hover:scale-105'
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className={`p-4 ${tool.bgColor} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {tool.icon}
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4">
                      <Button 
                        disabled={tool.comingSoon}
                        className={`w-full text-white font-medium py-2.5 transition-all duration-300 ${
                          tool.comingSoon 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                        }`}
                        onClick={() => !tool.comingSoon && navigate(tool.path)}
                      >
                        {tool.comingSoon ? (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            <Wrench className="w-4 h-4 mr-2" />
                            Access Tool
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                If you need assistance with any of these tools or have suggestions for new ones, 
                feel free to reach out to our support team.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/about')}
                className="px-8 py-2.5"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </NotificationProvider>
    </div>
  );
};

export default Tools;
