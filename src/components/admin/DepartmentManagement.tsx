import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

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

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    id: '',
    name: '',
    description: '',
    campus: '',
    faculty_id: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const campusOptions = ['Uli', 'Igbariam'];

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*, faculties(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error.message);
      toast({
        title: "Error fetching departments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setFaculties(data || []);
    } catch (error: any) {
      console.error('Error fetching faculties:', error.message);
      toast({
        title: "Error fetching faculties",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDepartmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (department?: Department | any) => {
    if (department) {
      let faculty_id = '';
      // If department.faculties is present and has id, use it.
      if (department.faculties && department.faculties.id) {
        faculty_id = department.faculties.id;
      } else if (department.faculty_id) {
        faculty_id = department.faculty_id;
      }
      setDepartmentForm({
        id: department.id,
        name: department.name,
        description: department.description || '',
        campus: department.campus || '',
        faculty_id: faculty_id,
      });
    } else {
      // Create mode (reset form)
      setDepartmentForm({
        id: '',
        name: '',
        description: '',
        campus: '',
        faculty_id: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDepartmentForm({
      id: '',
      name: '',
      description: '',
      campus: '',
      faculty_id: '',
    });
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate inputs
      if (!departmentForm.name.trim()) {
        throw new Error("Department name is required");
      }

      if (!departmentForm.faculty_id) {
        throw new Error("Faculty is required");
      }

      if (departmentForm.id) {
        // Update existing department
        const { data, error } = await supabase
          .from('departments')
          .update({
            name: departmentForm.name.trim(),
            description: departmentForm.description?.trim(),
            campus: departmentForm.campus?.trim(),
            faculty_id: departmentForm.faculty_id,
          })
          .eq('id', departmentForm.id);

        if (error) throw error;

        toast({
          title: "Department updated",
          description: "The department has been updated successfully.",
        });
      } else {
        // Create new department
        const { data, error } = await supabase
          .from('departments')
          .insert([{
            name: departmentForm.name.trim(),
            description: departmentForm.description?.trim(),
            campus: departmentForm.campus?.trim(),
            faculty_id: departmentForm.faculty_id,
          }]);

        if (error) throw error;

        toast({
          title: "Department created",
          description: "The department has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      console.error('Error saving department:', error.message);
      toast({
        title: "Error saving department",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      });

      fetchDepartments();
    } catch (error: any) {
      console.error('Error deleting department:', error.message);
      toast({
        title: "Error deleting department",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-gray-600">Manage departments and their details</p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !departments.length ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Departments Found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No departments match "${searchTerm}"`
                  : "No departments have been created yet."}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first department
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department: any) => (
                    <TableRow key={department.id}>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>{department.faculties?.name || 'N/A'}</TableCell>
                      <TableCell>{department.campus || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(department)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDepartment(department.id)}
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
              <DialogTitle>{departmentForm.id ? 'Edit Department' : 'Add New Department'}</DialogTitle>
              <DialogDescription>
                {departmentForm.id
                  ? 'Update department details'
                  : 'Create a new department'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveDepartment} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={departmentForm.name}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  required
                />
              </div>

              <div>
                <Label htmlFor="faculty_id">Faculty</Label>
                <Select
                  value={departmentForm.faculty_id}
                  onValueChange={(value) => setDepartmentForm((prev) => ({ ...prev, faculty_id: value }))}
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={departmentForm.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the department"
                />
              </div>

              <div>
                <Label htmlFor="campus">Campus (Optional)</Label>
                <Select
                  value={departmentForm.campus}
                  onValueChange={(value) => setDepartmentForm((prev) => ({ ...prev, campus: value }))}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : departmentForm.id ? 'Update' : 'Create'} Department
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
