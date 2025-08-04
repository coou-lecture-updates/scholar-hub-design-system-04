import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, Plus, Edit, Trash2, School, Search } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface TimetableLecture {
  id: number;
  subject: string;
  faculty: string;
  department: string;
  level: number;
  semester: string;
  academic_year: string;
  time: string;
  day: string;
  room: string;
  campus: string;
  lecturer?: string;
  color?: string;
}

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const timeSlots = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM'
];

const semesters = [
  'First Semester',
  'Second Semester'
];

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-100' },
  { name: 'Green', value: 'bg-green-100' },
  { name: 'Yellow', value: 'bg-yellow-100' },
  { name: 'Purple', value: 'bg-purple-100' },
  { name: 'Pink', value: 'bg-pink-100' },
  { name: 'Indigo', value: 'bg-indigo-100' },
  { name: 'Red', value: 'bg-red-100' },
  { name: 'Orange', value: 'bg-orange-100' },
  { name: 'Teal', value: 'bg-teal-100' },
  { name: 'Cyan', value: 'bg-cyan-100' }
];

const campusOptions = ['Uli', 'Igbariam'];

const TimetableManagement = () => {
  const [lectures, setLectures] = useState<TimetableLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [
    `${currentYear-1}/${currentYear}`,
    `${currentYear}/${currentYear+1}`,
    `${currentYear+1}/${currentYear+2}`
  ];
  
  const [lectureForm, setLectureForm] = useState({
    id: 0,
    subject: '',
    faculty: '',
    department: '',
    level: 100,
    semester: 'First Semester',
    academic_year: `${currentYear}/${currentYear+1}`,
    time: '8:00 AM - 9:00 AM',
    day: 'Monday',
    room: '',
    campus: 'Uli',
    color: 'bg-blue-100',
    lecturer: ''
  });
  
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchLectures();
    fetchFacultyAndDepts();
  }, []);
  
  const fetchLectures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .order('day', { ascending: true });
      
      if (error) throw error;
      
      setLectures(data || []);
    } catch (error: any) {
      console.error('Error fetching lectures:', error.message);
      toast({
        title: "Error fetching timetable",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFacultyAndDepts = async () => {
    try {
      // Fetch faculties
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .order('name', { ascending: true });
      
      if (facultiesError) throw facultiesError;
      setFaculties(facultiesData || []);
      
      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });
      
      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData || []);
    } catch (error: any) {
      console.error('Error fetching faculties and departments:', error.message);
    }
  };
  
  useEffect(() => {
    // Filter departments based on selected faculty
    if (lectureForm.faculty) {
      const filtered = departments.filter(dept => dept.faculty_id === lectureForm.faculty);
      setFilteredDepartments(filtered);
      
      // If the currently selected department is not in the filtered list, reset it
      if (filtered.length > 0 && !filtered.find(dept => dept.id === lectureForm.department)) {
        setLectureForm(prev => ({ ...prev, department: filtered[0].id }));
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [lectureForm.faculty, departments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLectureForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string | number) => {
    setLectureForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleOpenDialog = (lecture?: TimetableLecture) => {
    if (lecture) {
      // Edit mode - find matching faculty ID based on faculty name
      const faculty = faculties.find(f => f.name === lecture.faculty);
      const department = departments.find(d => d.name === lecture.department);
      
      setLectureForm({
        id: lecture.id,
        subject: lecture.subject,
        faculty: faculty?.id || '',
        department: department?.id || '',
        level: lecture.level,
        semester: lecture.semester,
        academic_year: lecture.academic_year,
        time: lecture.time,
        day: lecture.day,
        room: lecture.room,
        campus: lecture.campus || 'Uli',
        color: lecture.color || 'bg-blue-100',
        lecturer: lecture.lecturer || ''
      });
    } else {
      // Create mode
      setLectureForm({
        id: 0,
        subject: '',
        faculty: faculties.length > 0 ? faculties[0].id : '',
        department: '',
        level: 100,
        semester: 'First Semester',
        academic_year: `${currentYear}/${currentYear+1}`,
        time: '8:00 AM - 9:00 AM',
        day: 'Monday',
        room: '',
        campus: 'Uli',
        color: 'bg-blue-100',
        lecturer: ''
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate inputs
      if (!lectureForm.subject.trim()) {
        throw new Error("Subject name is required");
      }
      
      if (!lectureForm.faculty) {
        throw new Error("Faculty is required");
      }
      
      if (!lectureForm.department) {
        throw new Error("Department is required");
      }
      
      if (!lectureForm.room.trim()) {
        throw new Error("Room location is required");
      }
      
      // Get faculty and department names
      const faculty = faculties.find(f => f.id === lectureForm.faculty);
      const department = departments.find(d => d.id === lectureForm.department);
      
      if (!faculty || !department) {
        throw new Error("Invalid faculty or department selection");
      }
      
      const lectureData = {
        subject: lectureForm.subject.trim(),
        faculty: faculty.name,
        department: department.name,
        level: lectureForm.level,
        semester: lectureForm.semester,
        academic_year: lectureForm.academic_year,
        time: lectureForm.time,
        day: lectureForm.day,
        room: lectureForm.room.trim(),
        campus: lectureForm.campus,
        color: lectureForm.color,
        lecturer: lectureForm.lecturer.trim()
      };
      
      if (lectureForm.id) {
        // Update existing lecture
        const { data, error } = await supabase
          .from('lectures')
          .update(lectureData)
          .eq('id', lectureForm.id);
        
        if (error) throw error;
        
        toast({
          title: "Lecture updated",
          description: "The lecture has been updated successfully.",
        });
      } else {
        // Create new lecture
        const { data, error } = await supabase
          .from('lectures')
          .insert([lectureData]);
        
        if (error) throw error;
        
        toast({
          title: "Lecture created",
          description: "The lecture has been created successfully.",
        });
      }
      
      setIsDialogOpen(false);
      fetchLectures();
    } catch (error: any) {
      console.error('Error saving lecture:', error.message);
      toast({
        title: "Error saving lecture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteLecture = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecture? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Lecture deleted",
        description: "The lecture has been deleted successfully.",
      });
      
      fetchLectures();
    } catch (error: any) {
      console.error('Error deleting lecture:', error.message);
      toast({
        title: "Error deleting lecture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter lectures based on search term and active tab
  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = 
      lecture.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.campus.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && lecture.campus.toLowerCase() === activeTab.toLowerCase();
    }
  });

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <p className="text-gray-600">Manage lecture timetables for all campuses</p>
          </div>
          
          <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Lecture
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search lectures by subject, faculty, department..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full pb-2">
            <TabsList className="mb-6 w-full md:w-auto flex overflow-x-auto">
              <TabsTrigger value="all">All Campuses</TabsTrigger>
              {campusOptions.map(campus => (
                <TabsTrigger key={campus} value={campus}>{campus} Campus</TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Lectures' : `${activeTab} Campus Lectures`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !lectures.length ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading timetable...</p>
                </div>
              ) : filteredLectures.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Lectures Found</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `No lectures match "${searchTerm}"` 
                      : activeTab !== 'all'
                        ? `No lectures found for ${activeTab} campus.`
                        : "No lectures have been created yet."}
                  </p>
                  {!searchTerm && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleOpenDialog()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first lecture
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[50vh]">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Day & Time</TableHead>
                          <TableHead>Faculty & Department</TableHead>
                          <TableHead>Level & Semester</TableHead>
                          <TableHead>Room & Campus</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLectures.map((lecture) => (
                          <TableRow key={lecture.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${lecture.color || 'bg-blue-100'} mr-2`}></div>
                                <div>
                                  <div className="font-medium">{lecture.subject}</div>
                                  {lecture.lecturer && (
                                    <div className="text-xs text-gray-500">Lecturer: {lecture.lecturer}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{lecture.day}</div>
                                <div className="text-xs text-gray-500">{lecture.time}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{lecture.faculty}</div>
                                <div className="text-xs text-gray-500">{lecture.department}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{lecture.level} Level</div>
                                <div className="text-xs text-gray-500">{lecture.semester}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{lecture.room}</div>
                                <div className="text-xs text-gray-500">{lecture.campus} Campus</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(lecture)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteLecture(lecture.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </Tabs>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh]">
            <ScrollArea className="max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>{lectureForm.id ? 'Edit Lecture' : 'Add New Lecture'}</DialogTitle>
                <DialogDescription>
                  {lectureForm.id 
                    ? 'Update lecture details in the timetable' 
                    : 'Add a new lecture to the timetable'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSaveLecture} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="subject">Subject/Course Name</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={lectureForm.subject}
                    onChange={handleInputChange}
                    placeholder="Introduction to Computer Science"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="faculty">Faculty</Label>
                    <Select 
                      value={lectureForm.faculty} 
                      onValueChange={(value) => handleSelectChange('faculty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map(faculty => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name} {faculty.campus && `(${faculty.campus})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={lectureForm.department} 
                      onValueChange={(value) => handleSelectChange('department', value)}
                      disabled={filteredDepartments.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filteredDepartments.length === 0 ? "Select faculty first" : "Select department"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartments.map(department => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={lectureForm.level.toString()} 
                      onValueChange={(value) => handleSelectChange('level', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[100, 200, 300, 400, 500, 600].map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            {level} Level
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select 
                      value={lectureForm.semester} 
                      onValueChange={(value) => handleSelectChange('semester', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map(semester => (
                          <SelectItem key={semester} value={semester}>
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select 
                      value={lectureForm.day} 
                      onValueChange={(value) => handleSelectChange('day', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Select 
                      value={lectureForm.time} 
                      onValueChange={(value) => handleSelectChange('time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(timeSlot => (
                          <SelectItem key={timeSlot} value={timeSlot}>
                            {timeSlot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room">Room/Location</Label>
                    <Input
                      id="room"
                      name="room"
                      value={lectureForm.room}
                      onChange={handleInputChange}
                      placeholder="LT1, Room 101, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="campus">Campus</Label>
                    <Select 
                      value={lectureForm.campus} 
                      onValueChange={(value) => handleSelectChange('campus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map(campus => (
                          <SelectItem key={campus} value={campus}>
                            {campus} Campus
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lecturer">Lecturer (Optional)</Label>
                    <Input
                      id="lecturer"
                      name="lecturer"
                      value={lectureForm.lecturer}
                      onChange={handleInputChange}
                      placeholder="Prof. John Doe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select 
                      value={lectureForm.color} 
                      onValueChange={(value) => handleSelectChange('color', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full ${color.value} mr-2`}></div>
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Select 
                    value={lectureForm.academic_year} 
                    onValueChange={(value) => handleSelectChange('academic_year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearOptions.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : lectureForm.id ? 'Update' : 'Create'} Lecture
                  </Button>
                </DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TimetableManagement;
