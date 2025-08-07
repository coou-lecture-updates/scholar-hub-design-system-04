import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, MapPin, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';

interface Lecture {
  id: number;
  subject: string;
  lecturer: string;
  room: string;
  day: string;
  time: string;
  level: number;
  faculty: string;
  department: string;
  campus: string;
  semester: string;
  academic_year: string;
  color: string;
}

export const TimetableManager: React.FC = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [filters, setFilters] = useState({
    faculty: '',
    department: '',
    level: '',
    semester: ''
  });

  const [formData, setFormData] = useState<Partial<Lecture>>({
    subject: '',
    lecturer: '',
    room: '',
    day: '',
    time: '',
    level: 100,
    faculty: '',
    department: '',
    campus: 'Main Campus',
    semester: 'First',
    academic_year: '2024/2025',
    color: 'bg-blue-100'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const levels = [100, 200, 300, 400, 500];
  const semesters = ['First', 'Second'];
  const faculties = ['Engineering', 'Sciences', 'Arts', 'Law', 'Medicine', 'Business'];
  const colors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100',
    'bg-pink-100', 'bg-indigo-100', 'bg-red-100', 'bg-orange-100'
  ];

  useEffect(() => {
    loadLectures();
  }, [filters]);

  const loadLectures = async () => {
    setLoading(true);
    try {
      let query = supabase.from('lectures').select('*');

      if (filters.faculty) query = query.eq('faculty', filters.faculty);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.level) query = query.eq('level', parseInt(filters.level));
      if (filters.semester) query = query.eq('semester', filters.semester);

      const { data, error } = await query.order('day').order('time');

      if (error) throw error;
      setLectures(data || []);
    } catch (error) {
      console.error('Error loading lectures:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingLecture) {
        const { error } = await supabase
          .from('lectures')
          .update(formData)
          .eq('id', editingLecture.id);

        if (error) throw error;
        toast.success('Lecture updated successfully');
      } else {
        const { error } = await supabase
          .from('lectures')
          .insert([formData as any]);

        if (error) throw error;
        toast.success('Lecture added successfully');
      }

      setShowForm(false);
      setEditingLecture(null);
      resetForm();
      loadLectures();
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast.error('Failed to save lecture');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Lecture deleted successfully');
      loadLectures();
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Failed to delete lecture');
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      lecturer: '',
      room: '',
      day: '',
      time: '',
      level: 100,
      faculty: '',
      department: '',
      campus: 'Main Campus',
      semester: 'First',
      academic_year: '2024/2025',
      color: 'bg-blue-100'
    });
  };

  const startEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData(lecture);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Timetable Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Faculty</Label>
              <Select value={filters.faculty} onValueChange={(value) => setFilters(prev => ({ ...prev, faculty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Faculties</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Level</Label>
              <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level.toString()}>{level} Level</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select value={filters.semester} onValueChange={(value) => setFilters(prev => ({ ...prev, semester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  {semesters.map(semester => (
                    <SelectItem key={semester} value={semester}>{semester} Semester</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ faculty: '', department: '', level: '', semester: '' })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lecture Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLecture ? 'Edit Lecture' : 'Add New Lecture'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lecturer">Lecturer</Label>
                <Input
                  id="lecturer"
                  value={formData.lecturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, lecturer: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={formData.day} onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 08:00 - 10:00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level?.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level.toString()}>{level} Level</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={formData.faculty} onValueChange={(value) => setFormData(prev => ({ ...prev, faculty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(faculty => (
                      <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>{semester} Semester</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingLecture ? 'Update' : 'Add'} Lecture
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingLecture(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lectures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Timetable ({lectures.length} lectures)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Day & Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures.map((lecture) => (
                  <TableRow key={lecture.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${lecture.color}`} />
                        <span className="font-medium">{lecture.subject}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{lecture.day} {lecture.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{lecture.room}</span>
                      </div>
                    </TableCell>
                    <TableCell>{lecture.lecturer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lecture.level} Level</Badge>
                    </TableCell>
                    <TableCell>{lecture.faculty}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(lecture)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(lecture.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {lectures.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No lectures found. Click "Add Lecture" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};