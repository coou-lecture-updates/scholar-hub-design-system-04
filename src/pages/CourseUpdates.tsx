import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CourseUpdates = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        let query = supabase.from('courses').select('*');
        
        // Filter by department/level if user profile has this info
        if (userProfile?.department) {
          query = query.eq('department_id', userProfile.department);
        }
        
        if (userProfile?.level) {
          query = query.eq('level', userProfile.level);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [userProfile, user, navigate]);

  // Group courses by semester
  const firstSemesterCourses = courses.filter(course => course.semester === '1st Semester');
  const secondSemesterCourses = courses.filter(course => course.semester === '2nd Semester');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Updates</h1>
          <p className="text-gray-600">Stay updated with your course information and materials</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-700 rounded-full border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No course updates available for your department and level.</p>
              <p className="text-gray-500 text-sm mt-2">
                {!userProfile?.department || !userProfile?.level ? 
                  "Complete your profile with department and level information to see relevant courses." : 
                  "Check back later for updates."}
              </p>
              <Button 
                onClick={() => navigate('/user-settings')} 
                className="mt-4 bg-blue-700 hover:bg-blue-800"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="first" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="first">First Semester</TabsTrigger>
              <TabsTrigger value="second">Second Semester</TabsTrigger>
            </TabsList>
            
            <TabsContent value="first">
              <div className="grid gap-4 mt-4">
                {firstSemesterCourses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No courses available for First Semester</p>
                    </CardContent>
                  </Card>
                ) : (
                  firstSemesterCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="second">
              <div className="grid gap-4 mt-4">
                {secondSemesterCourses.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No courses available for Second Semester</p>
                    </CardContent>
                  </Card>
                ) : (
                  secondSemesterCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-3/4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{course.title}</h3>
              <p className="text-sm text-gray-500">{course.code}</p>
            </div>
            <Badge variant={course.semester === '1st Semester' ? 'default' : 'secondary'}>
              {course.semester}
            </Badge>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">{course.description}</p>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Credit Units</p>
              <p className="font-medium">{course.credit_units}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Level</p>
              <p className="font-medium">{course.level}</p>
            </div>
          </div>
        </div>
        
        {course.image_url && (
          <div 
            className="w-full h-32 md:h-auto md:w-1/4 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.image_url})` }}
          />
        )}
      </div>
    </Card>
  );
};

export default CourseUpdates;
