
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Calendar, Clock, Plus, Edit, Trash2, Book, AlertTriangle } from 'lucide-react';

interface Exam {
  id: string;
  course_code: string;
  course_title: string;
  exam_date: string;
  exam_time: string;
  venue: string;
  department: string;
  level: number;
  exam_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const examTypes = ['Regular', 'Resit', 'Special'];
const examStatuses = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];
const levels = [100, 200, 300, 400, 500, 600];

const ExamManagement = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState<Exam>({
    id: '',
    course_code: '',
    course_title: '',
    exam_date: new Date().toISOString().split('T')[0],
    exam_time: '08:00',
    venue: '',
    department: '',
    level: 100,
    exam_type: 'Regular',
    status: 'Scheduled',
    created_at: '',
    updated_at: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('exam_date', { ascending: true });

      if (error) throw error;

      setExams(data || []);
    } catch (error: any) {
      console.error('Error fetching exams:', error.message);
      toast({
        title: "Error fetching exams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExamForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setExamForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (exam?: Exam) => {
    if (exam) {
      // Edit mode
      setExamForm({ ...exam });
    } else {
      // Create mode
      setExamForm({
        id: '',
        course_code: '',
        course_title: '',
        exam_date: new Date().toISOString().split('T')[0],
        exam_time: '08:00',
        venue: '',
        department: '',
        level: 100,
        exam_type: 'Regular',
        status: 'Scheduled',
        created_at: '',
        updated_at: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate inputs
      if (!examForm.course_code.trim()) {
        throw new Error("Course code is required");
      }

      if (!examForm.course_title.trim()) {
        throw new Error("Course title is required");
      }

      if (!examForm.venue.trim()) {
        throw new Error("Venue is required");
      }

      const examData = {
        course_code: examForm.course_code.trim(),
        course_title: examForm.course_title.trim(),
        exam_date: examForm.exam_date,
        exam_time: examForm.exam_time,
        venue: examForm.venue.trim(),
        department: examForm.department,
        level: examForm.level,
        exam_type: examForm.exam_type,
        status: examForm.status,
      };

      if (examForm.id) {
        // Update existing exam
        const { data, error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', examForm.id);

        if (error) throw error;

        toast({
          title: "Exam updated",
          description: "The exam has been updated successfully.",
        });
      } else {
        // Create new exam
        const { data, error } = await supabase
          .from('exams')
          .insert([examData]);

        if (error) throw error;

        toast({
          title: "Exam created",
          description: "The exam has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      fetchExams();
    } catch (error: any) {
      console.error('Error saving exam:', error.message);
      toast({
        title: "Error saving exam",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Exam deleted",
        description: "The exam has been deleted successfully.",
      });

      fetchExams();
    } catch (error: any) {
      console.error('Error deleting exam:', error.message);
      toast({
        title: "Error deleting exam",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <p className="text-gray-600">Manage exam schedules and details</p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>View, edit, and manage exam schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-10">
              <Book className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Exams Scheduled</h3>
              <p className="text-gray-600">No exams have been scheduled yet. Click the button above to add a new exam.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule your first exam
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.course_code}</TableCell>
                      <TableCell>{exam.course_title}</TableCell>
                      <TableCell>
                        <div>{new Date(exam.exam_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{exam.exam_time}</div>
                      </TableCell>
                      <TableCell>{exam.venue}</TableCell>
                      <TableCell>{exam.department}</TableCell>
                      <TableCell>{exam.level} Level</TableCell>
                      <TableCell>{exam.exam_type}</TableCell>
                      <TableCell>{exam.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(exam)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <ScrollArea className="max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>{examForm.id ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
              <DialogDescription>
                {examForm.id
                  ? 'Update exam details in the schedule'
                  : 'Add a new exam to the schedule'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveExam} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_code">Course Code</Label>
                  <Input
                    id="course_code"
                    name="course_code"
                    value={examForm.course_code}
                    onChange={handleInputChange}
                    placeholder="CSC101"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="course_title">Course Title</Label>
                  <Input
                    id="course_title"
                    name="course_title"
                    value={examForm.course_title}
                    onChange={handleInputChange}
                    placeholder="Introduction to Computer Science"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input
                    type="date"
                    id="exam_date"
                    name="exam_date"
                    value={examForm.exam_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="exam_time">Exam Time</Label>
                  <Input
                    type="time"
                    id="exam_time"
                    name="exam_time"
                    value={examForm.exam_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={examForm.venue}
                  onChange={handleInputChange}
                  placeholder="LT1, Room 101, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={examForm.department}
                    onChange={handleInputChange}
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={examForm.level.toString()}
                    onValueChange={(value) => handleSelectChange('level', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {level} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam_type">Exam Type</Label>
                  <Select
                    value={examForm.exam_type}
                    onValueChange={(value) => handleSelectChange('exam_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={examForm.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {examStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  {loading ? 'Saving...' : examForm.id ? 'Update' : 'Create'} Exam
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;
