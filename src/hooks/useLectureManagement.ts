
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lecture, LectureFormData } from '@/types/lecture';

export const useLectureManagement = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<LectureFormData>({
    day: '',
    time: '',
    subject: '',
    room: '',
    lecturer: '',
    level: '',
    faculty: '',
    department: '',
    campus: '',
    semester: '',
    academic_year: '',
    color: 'bg-blue-100'
  });

  useEffect(() => {
    fetchLectures();
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
        title: "Error fetching lectures",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        level: parseInt(formData.level)
      };
      
      if (editingLecture) {
        const { error } = await supabase
          .from('lectures')
          .update(submitData)
          .eq('id', editingLecture.id);
        
        if (error) throw error;
        
        toast({
          title: "Lecture updated",
          description: "The lecture has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('lectures')
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Lecture created",
          description: "The lecture has been created successfully.",
        });
      }
      
      setShowForm(false);
      setEditingLecture(null);
      resetForm();
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

  const handleEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData({
      day: lecture.day,
      time: lecture.time,
      subject: lecture.subject,
      room: lecture.room,
      lecturer: lecture.lecturer || '',
      level: lecture.level.toString(),
      faculty: lecture.faculty,
      department: lecture.department,
      campus: lecture.campus,
      semester: lecture.semester,
      academic_year: lecture.academic_year,
      color: lecture.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    
    try {
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
    }
  };

  const resetForm = () => {
    setFormData({
      day: '',
      time: '',
      subject: '',
      room: '',
      lecturer: '',
      level: '',
      faculty: '',
      department: '',
      campus: '',
      semester: '',
      academic_year: '',
      color: 'bg-blue-100'
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLecture(null);
    resetForm();
  };

  return {
    lectures,
    loading,
    showForm,
    setShowForm,
    editingLecture,
    formData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleInputChange,
    handleCancel
  };
};
