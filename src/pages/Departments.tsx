
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Users, BookOpen, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Department {
  id: string;
  name: string;
  description?: string;
  campus?: string;
  faculty_id: string;
  created_at: string;
  updated_at: string;
}

interface Faculty {
  id: string;
  name: string;
  campus?: string;
}

const Departments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments with faculty information
      const { data: departmentsData, error: deptError } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          description,
          campus,
          faculty_id,
          created_at,
          updated_at,
          faculties (
            id,
            name,
            campus
          )
        `)
        .order('name');

      if (deptError) throw deptError;

      // Fetch faculties for filter
      const { data: facultiesData, error: facError } = await supabase
        .from('faculties')
        .select('id, name, campus')
        .order('name');

      if (facError) throw facError;

      setDepartments(departmentsData || []);
      setFaculties(facultiesData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCampus = selectedCampus === 'all' || dept.campus === selectedCampus;
    
    const matchesFaculty = selectedFaculty === 'all' || dept.faculty_id === selectedFaculty;
    
    return matchesSearch && matchesCampus && matchesFaculty;
  });

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty?.name || 'Unknown Faculty';
  };

  const getCampuses = () => {
    const campuses = [...new Set(departments.map(d => d.campus).filter(Boolean))];
    return campuses;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Academic Departments</h1>
          <p className="text-gray-600">Explore all academic departments across COOU campuses</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {getCampuses().map(campus => (
                    <SelectItem key={campus} value={campus}>
                      {campus} Campus
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculties.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campuses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCampuses().length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredDepartments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No departments found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredDepartments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg leading-tight">{department.name}</CardTitle>
                    <Badge variant="outline">{department.campus || 'Main'}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {getFacultyName(department.faculty_id)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {department.description || 'Department description not available.'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Established:</span>
                      <span>{new Date(department.created_at).getFullYear()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Faculty:</span>
                      <Badge variant="secondary" className="text-xs">
                        {getFacultyName(department.faculty_id)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Faculty Groups */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Departments by Faculty</h2>
          {faculties.map(faculty => {
            const facultyDepts = filteredDepartments.filter(d => d.faculty_id === faculty.id);
            if (facultyDepts.length === 0) return null;

            return (
              <Card key={faculty.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {faculty.name}
                    <Badge variant="outline" className="ml-2">
                      {facultyDepts.length} departments
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {facultyDepts.map(dept => (
                      <div key={dept.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{dept.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {dept.description?.slice(0, 80)}...
                        </p>
                        {dept.campus && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {dept.campus}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
