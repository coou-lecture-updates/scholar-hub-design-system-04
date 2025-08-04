import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Building, BookOpen, User, Plus, Edit, Trash2, Eye } from 'lucide-react';
import CreateDepartmentDialog from './CreateDepartmentDialog';

interface Faculty {
  id: string;
  name: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  faculty_id: string;
  campus: string;
  created_at: string;
  updated_at: string;
  faculty?: Faculty;
}

interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  department_id: string;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department_id: string;
}

const DepartmentOrgChart = ({ departments, faculties }: { departments: Department[], faculties: Faculty[] }) => {
  const facultyGroups = faculties.map(faculty => ({
    ...faculty,
    departments: departments.filter(dept => dept.faculty_id === faculty.id)
  }));

  return (
    <div className="space-y-6">
      {facultyGroups.map(faculty => (
        <Card key={faculty.id} className="border-2">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {faculty.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faculty.departments.map(dept => (
                <Card key={dept.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{dept.name}</CardTitle>
                    <CardDescription className="text-xs">{dept.campus}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600">{dept.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const EnhancedDepartmentManagement = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch faculties
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .order('name');

      if (facultiesError) throw facultiesError;
      setFaculties(facultiesData || []);

      // Fetch departments with faculties
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select(`
          *,
          faculties!departments_faculty_id_fkey (
            id,
            name,
            created_at
          )
        `)
        .order('name');

      if (departmentsError) throw departmentsError;
      
      // Transform the data to match our interface
      const transformedDepartments = departmentsData?.map(dept => ({
        ...dept,
        faculty: dept.faculties as Faculty
      })) || [];
      
      setDepartments(transformedDepartments);

      // Fetch courses and transform credit_units to credits
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('code');

      if (coursesError) throw coursesError;
      
      const transformedCourses = coursesData?.map(course => ({
        ...course,
        credits: course.credit_units // Map credit_units to credits
      })) || [];
      
      setCourses(transformedCourses);

      // Fetch lecturers (from users table with lecturer role)
      const { data: lecturersData, error: lecturersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'lecturer');

      if (lecturersError) throw lecturersError;
      
      const transformedLecturers = lecturersData?.map(lecturer => ({
        id: lecturer.id,
        name: lecturer.full_name || 'Unknown',
        email: lecturer.email || '',
        specialization: 'General',
        department_id: ''
      })) || [];
      
      setLecturers(transformedLecturers);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load department data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentCourses = (departmentId: string) => {
    return courses.filter(course => course.department_id === departmentId);
  };

  const getDepartmentLecturers = (departmentId: string) => {
    return lecturers.filter(lecturer => lecturer.department_id === departmentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-gray-600">Manage faculties, departments, courses, and lecturers</p>
        </div>
        <div className="flex gap-2">
          <CreateDepartmentDialog 
            faculties={faculties}
            onDepartmentCreated={fetchData}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hierarchy">Faculty Hierarchy</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faculties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{faculties.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lecturers.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <CardTitle>Faculty & Department Hierarchy</CardTitle>
              <CardDescription>Visual representation of the academic structure</CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentOrgChart departments={departments} faculties={faculties} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage all departments across faculties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map(department => (
                  <Card key={department.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{department.name}</CardTitle>
                          <CardDescription>{department.faculty?.name}</CardDescription>
                        </div>
                        <Badge variant="outline">{department.campus}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{getDepartmentCourses(department.id).length} courses</span>
                        <span>{getDepartmentLecturers(department.id).length} lecturers</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Manage academic courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{course.code} - {course.title}</h3>
                      <p className="text-sm text-gray-600">{course.credits} credits</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lecturers">
          <Card>
            <CardHeader>
              <CardTitle>Lecturers</CardTitle>
              <CardDescription>Manage academic staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lecturers.map(lecturer => (
                  <div key={lecturer.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{lecturer.name}</h3>
                      <p className="text-sm text-gray-600">{lecturer.email}</p>
                      <p className="text-sm text-gray-500">{lecturer.specialization}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDepartmentManagement;
