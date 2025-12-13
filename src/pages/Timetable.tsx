import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
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
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading your timetable...</span>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Show "No classes" as fallback instead of empty
  return (
    <DashboardLayout>
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Class Timetable</h2>
              {userProfile && (
                <p className="text-sm text-muted-foreground mt-1">
                  {userProfile.level ? `${userProfile.level} Level` : ""} • {userProfile.department} • {userProfile.faculty} • {userProfile.campus} Campus
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={prevWeek}
                  disabled={currentWeek === 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-foreground">Week {currentWeek}</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={nextWeek}
                  disabled={currentWeek === 2}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="text-primary">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          {lectures.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No classes found for your profile.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Make sure your profile information is complete and classes have been scheduled.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time / Day
                    </th>
                    {days.map(day => (
                      <th key={day} className="border border-border bg-muted p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="border border-border p-3 text-xs font-medium text-muted-foreground bg-card">
                        {timeSlot}
                      </td>
                      {days.map(day => {
                        const classData = getClassForTimeSlot(day, timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-border p-3 bg-card">
                            {classData ? (
                              <div className={`${classData.color || 'bg-primary/10'} p-2 rounded border border-primary/20`}>
                                <div className="font-medium text-primary">{classData.subject}</div>
                                <div className="text-xs text-muted-foreground">{classData.room}</div>
                                {classData.lecturer && (
                                  <div className="text-xs text-muted-foreground">{classData.lecturer}</div>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Timetable;
