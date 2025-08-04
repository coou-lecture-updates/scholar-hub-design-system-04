import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LectureData {
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

const Timetable = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [lectures, setLectures] = useState<LectureData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Time slots
  const timeSlots = [
    '08:00 - 09:30',
    '09:45 - 11:15',
    '11:30 - 13:00',
    '13:15 - 14:45',
    '15:00 - 16:30',
    '16:45 - 18:15'
  ];

  useEffect(() => {
    fetchUserLectures();
  }, [userProfile]);

  const fetchUserLectures = async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Build the query based on user profile
      let query = supabase
        .from('lectures')
        .select('*');

      // Filter by user's level
      if (userProfile.level) {
        query = query.eq('level', userProfile.level);
      }

      // Filter by user's faculty
      if (userProfile.faculty) {
        query = query.eq('faculty', userProfile.faculty);
      }

      // Filter by user's department
      if (userProfile.department) {
        query = query.eq('department', userProfile.department);
      }

      // Filter by user's campus
      if (userProfile.campus) {
        query = query.eq('campus', userProfile.campus);
      }

      const { data, error } = await query.order('day').order('time');

      if (error) {
        throw error;
      }

      setLectures(data || []);
    } catch (error: any) {
      console.error('Error fetching lectures:', error);
      toast({
        title: "Error loading timetable",
        description: "Failed to load your personalized timetable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get class for the specified day and time slot
  const getClassForTimeSlot = (day: string, timeSlot: string) => {
    return lectures.find(lecture => 
      lecture.day === day && lecture.time === timeSlot
    );
  };
  
  // Handle week navigation (for future implementation of multiple weeks)
  const prevWeek = () => setCurrentWeek(prev => Math.max(1, prev - 1));
  const nextWeek = () => setCurrentWeek(prev => Math.min(2, prev + 1));
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <span className="ml-2">Loading your timetable...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show "No classes" as fallback instead of empty
  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Class Timetable</h2>
            {userProfile && (
              <p className="text-sm text-gray-600 mt-1">
                {/* Always format as 100 Level etc */}
                {userProfile.level ? `${userProfile.level} Level` : ""} • {userProfile.department} • {userProfile.faculty} • {userProfile.campus} Campus
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevWeek}
                disabled={currentWeek === 1}
                className={`p-1 rounded-full ${
                  currentWeek === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium">Week {currentWeek}</span>
              <button 
                onClick={nextWeek}
                disabled={currentWeek === 2}
                className={`p-1 rounded-full ${
                  currentWeek === 2 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button className="flex items-center space-x-1 text-sm text-primary hover:underline">
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
        </div>
        {lectures.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No classes found for your profile.</p>
            <p className="text-sm text-gray-400 mt-2">
              Make sure your profile information is complete and classes have been scheduled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time / Day
                  </th>
                  {days.map(day => (
                    <th key={day} className="border border-gray-200 bg-gray-50 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-200 p-3 text-xs font-medium text-gray-500">
                      {timeSlot}
                    </td>
                    {days.map(day => {
                      const classData = getClassForTimeSlot(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3">
                          {classData ? (
                            <div className={`${classData.color || 'bg-blue-50'} p-2 rounded border border-blue-100`}>
                              <div className="font-medium text-blue-800">{classData.subject}</div>
                              <div className="text-xs text-gray-600">{classData.room}</div>
                              {classData.lecturer && (
                                <div className="text-xs text-gray-600">{classData.lecturer}</div>
                              )}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Timetable;
