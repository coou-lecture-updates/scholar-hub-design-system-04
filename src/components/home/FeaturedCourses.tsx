
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  code: string;
  department_id: string;
  description: string;
  level: number;
  credit_units: number;
  semester: string;
  image_url?: string;
  campus?: string;
}

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCampus, setActiveCampus] = useState<string>('all');
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .limit(6);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add campus field if missing (for backward compatibility)
          const processedCourses = data.map((course: Course) => ({
            ...course,
            campus: course.campus || 'Uli' // Default to Uli campus if not specified
          }));
          setCourses(processedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Default image URLs if no image is provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
  ];
  
  // Filter courses by campus
  const filteredCourses = activeCampus === 'all' 
    ? courses
    : courses.filter(course => course.campus === activeCampus);
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Courses</h2>
            <p className="mt-2 text-base md:text-lg text-gray-600">Explore our top-rated courses across various disciplines</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              variant={activeCampus === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveCampus('all')}
              className={activeCampus === 'all' ? 'bg-blue-700' : ''}
            >
              All Campuses
            </Button>
            <Button 
              variant={activeCampus === 'Uli' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveCampus('Uli')}
              className={activeCampus === 'Uli' ? 'bg-blue-700' : ''}
            >
              Uli Campus
            </Button>
            <Button 
              variant={activeCampus === 'Igbariam' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveCampus('Igbariam')}
              className={activeCampus === 'Igbariam' ? 'bg-blue-700' : ''}
            >
              Igbariam Campus
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No courses available for {activeCampus === 'all' ? 'any campus' : activeCampus + ' campus'}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={course.image_url || defaultImages[index % defaultImages.length]} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultImages[index % defaultImages.length];
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {course.code}
                    </Badge>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-secondary/30 text-gray-700 border-secondary/20">
                        {`${course.level}L`}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {course.campus}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mt-2">{course.title}</h3>
                  <p className="text-gray-600">{`Semester: ${course.semester}`}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{`${course.credit_units} Units`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{Math.floor(Math.random() * 100) + 20} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/courses/${course.id}`} className="w-full">
                    <Button className="w-full">View Course</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
      </div>
    </section>
  );
};

export default FeaturedCourses;
