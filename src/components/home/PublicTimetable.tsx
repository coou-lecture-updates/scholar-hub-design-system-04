
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye, LogIn } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Faculty {
  id: string;
  name: string;
  campus: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
  campus: string;
}

interface Lecture {
  id: number;
  subject: string;
  department: string;
  faculty: string;
  campus: string;
  level: number;
  day: string;
  time: string;
  room: string;
  lecturer: string | null;
}

const PublicTimetable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [campus, setCampus] = useState<string>("all");
  const [faculty, setFaculty] = useState<string>("all");
  const [department, setDepartment] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [day, setDay] = useState<string>("all");
  const [timetableData, setTimetableData] = useState<Lecture[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch faculties and departments from database
  useEffect(() => {
    const fetchFacultiesAndDepartments = async () => {
      try {
        const { data: facultiesData, error: facultiesError } = await supabase
          .from('faculties')
          .select('*')
          .order('name');

        if (facultiesError) throw facultiesError;

        const { data: departmentsData, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (departmentsError) throw departmentsError;

        setFaculties(facultiesData || []);
        setDepartments(departmentsData || []);
      } catch (error) {
        console.error('Error fetching faculties and departments:', error);
        toast({
          title: "Error",
          description: "Failed to load faculties and departments",
          variant: "destructive",
        });
      }
    };

    fetchFacultiesAndDepartments();
  }, [toast]);
  
  // Fetch lecture data
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lectures')
          .select('*')
          .order('day', { ascending: true });

        if (error) throw error;

        setTimetableData(data || []);
      } catch (error) {
        console.error('Error fetching lectures:', error);
        toast({
          title: "Error",
          description: "Failed to load timetable data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [toast]);
  
  // Filter timetable data based on filters
  const filteredTimetable = timetableData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.lecturer && item.lecturer.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCampus = campus === "all" || item.campus === campus;
    const matchesFaculty = faculty === "all" || item.faculty === faculty;
    const matchesDepartment = department === "all" || item.department === department;
    const matchesLevel = level === "all" || String(item.level) === level;
    const matchesDay = day === "all" || item.day === day;
    
    return matchesSearch && matchesCampus && matchesFaculty && matchesDepartment && matchesLevel && matchesDay;
  });

  // Limit to 10 items unless user is authenticated or showAll is true
  const displayedTimetable = (!user && !showAll) ? filteredTimetable.slice(0, 10) : filteredTimetable;
  const hasMoreItems = !user && !showAll && filteredTimetable.length > 10;
  
  // Get unique values for filters
  const campuses = Array.from(new Set([
    ...faculties.map(f => f.campus).filter(Boolean),
    ...timetableData.map(item => item.campus)
  ])).sort();
  
  // Filter faculty options based on selected campus
  const facultyOptions = campus === "all" 
    ? faculties 
    : faculties.filter(f => f.campus === campus);
  
  // Filter department options based on selected faculty and campus
  const departmentOptions = departments.filter(d => {
    if (faculty === "all" && campus === "all") return true;
    if (faculty !== "all" && campus !== "all") {
      // Find faculty object by name and campus for correct matching
      const selectedFaculty = faculties.find(
        f => f.name === faculty && f.campus === campus
      );
      // Only show depts belonging to this faculty and campus
      return selectedFaculty && d.faculty_id === selectedFaculty.id && d.campus === campus;
    }
    if (faculty !== "all") {
      // In case campus is all, but faculty is selected
      const selectedFaculty = faculties.find(f => f.name === faculty);
      return selectedFaculty && d.faculty_id === selectedFaculty.id;
    }
    if (campus !== "all") {
      // In case campus selected but not faculty
      return d.campus === campus;
    }
    // Default: show all
    return true;
  });
  
  // Get available levels based on filtered data
  const getAvailableLevels = () => {
    let filteredData = timetableData;
    
    if (campus !== "all") {
      filteredData = filteredData.filter(item => item.campus === campus);
    }
    if (faculty !== "all") {
      filteredData = filteredData.filter(item => item.faculty === faculty);
    }
    if (department !== "all") {
      filteredData = filteredData.filter(item => item.department === department);
    }
    
    return Array.from(new Set(filteredData.map(item => String(item.level)))).sort();
  };
  
  const availableLevels = getAvailableLevels();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Reset dependent filters when parent filter changes
  const handleCampusChange = (value: string) => {
    setCampus(value);
    setFaculty("all");
    setDepartment("all");
    setLevel("all");
  };

  const handleFacultyChange = (value: string) => {
    setFaculty(value);
    setDepartment("all");
    setLevel("all");
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setLevel("all");
  };

  const handleSeeMore = () => {
    if (user) {
      setShowAll(true);
    } else {
      navigate('/login');
    }
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">COOU Timetable</h2>
          <p className="mt-2 text-lg text-gray-600">View and filter class schedules for both Uli and Igbariam campuses</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Search input */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by course or lecturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="flex items-center gap-2" variant="outline">
              <Filter size={18} />
              Filters
            </Button>
          </div>
          
          {/* Filter controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* Campus filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Campus</label>
              <Select value={campus} onValueChange={handleCampusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Campuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Faculty filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Faculty</label>
              <Select value={faculty} onValueChange={handleFacultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {facultyOptions.map((f) => (
                    <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Department filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
              <Select value={department} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Level filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {availableLevels.map((l) => (
                    <SelectItem key={l} value={l}>{l} Level</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Day filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Day</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset filters button */}
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery("");
                  setCampus("all");
                  setFaculty("all");
                  setDepartment("all");
                  setLevel("all");
                  setDay("all");
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Timetable results */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-700 rounded-full border-t-transparent"></div>
            </div>
          ) : displayedTimetable.length > 0 ? (
            <>
              <div className="overflow-x-auto mb-6">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedTimetable.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.subject}</div>
                          <div className="text-sm text-gray-500">{item.department} • {item.level} Level</div>
                          {item.lecturer && <div className="text-sm text-gray-500">{item.lecturer}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.day}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.room}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.campus === "Uli" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {item.campus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Show "See More" button if there are more items and user is not authenticated */}
              {hasMoreItems && (
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 mb-4 text-center">
                    Showing {displayedTimetable.length} of {filteredTimetable.length} timetable entries
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button onClick={handleSeeMore} className="flex items-center justify-center gap-2 flex-1">
                      <Eye className="w-4 h-4" />
                      See All ({filteredTimetable.length - 10} more)
                    </Button>
                    <Button onClick={() => navigate('/login')} variant="outline" className="flex items-center justify-center gap-2 flex-1">
                      <LogIn className="w-4 h-4" />
                      Login to View All
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No classes found</h3>
              <p className="text-gray-500">Try changing your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicTimetable;
