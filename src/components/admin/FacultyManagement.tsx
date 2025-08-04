
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2, School } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  description?: string;
  campus?: string;
  created_at: string;
  updated_at: string;
}

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    id: '',
    name: '',
    description: '',
    campus: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const campusOptions = ['Uli', 'Igbariam', 'Awka'];

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFaculties(data || []);
    } catch (error: any) {
      console.error('Error fetching faculties:', error.message);
      toast({
        title: "Error fetching faculties",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFacultyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (faculty?: Faculty) => {
    if (faculty) {
      // Edit mode
      setFacultyForm({
        id: faculty.id,
        name: faculty.name,
        description: faculty.description || '',
        campus: faculty.campus || '',
      });
    } else {
      // Create mode
      setFacultyForm({
        id: '',
        name: '',
        description: '',
        campus: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFacultyForm({
      id: '',
      name: '',
      description: '',
      campus: '',
    });
  };

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate inputs
      if (!facultyForm.name.trim()) {
        throw new Error("Faculty name is required");
      }

      if (facultyForm.id) {
        // Update existing faculty
        const { data, error } = await supabase
          .from('faculties')
          .update({
            name: facultyForm.name.trim(),
            description: facultyForm.description?.trim(),
            campus: facultyForm.campus?.trim(),
          })
          .eq('id', facultyForm.id);

        if (error) throw error;

        toast({
          title: "Faculty updated",
          description: "The faculty has been updated successfully.",
        });
      } else {
        // Create new faculty
        const { data, error } = await supabase
          .from('faculties')
          .insert([{
            name: facultyForm.name.trim(),
            description: facultyForm.description?.trim(),
            campus: facultyForm.campus?.trim(),
          }]);

        if (error) throw error;

        toast({
          title: "Faculty created",
          description: "The faculty has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      fetchFaculties();
    } catch (error: any) {
      console.error('Error saving faculty:', error.message);
      toast({
        title: "Error saving faculty",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('faculties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Faculty deleted",
        description: "The faculty has been deleted successfully.",
      });

      fetchFaculties();
    } catch (error: any) {
      console.error('Error deleting faculty:', error.message);
      toast({
        title: "Error deleting faculty",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <p className="text-gray-600">Manage faculties and their details</p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Faculty
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search faculties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculties</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !faculties.length ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading faculties...</p>
            </div>
          ) : filteredFaculties.length === 0 ? (
            <div className="text-center py-10">
              <School className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Faculties Found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No faculties match "${searchTerm}"`
                  : "No faculties have been created yet."}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first faculty
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell>{faculty.campus || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(faculty)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFaculty(faculty.id)}
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
              <DialogTitle>{facultyForm.id ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
              <DialogDescription>
                {facultyForm.id
                  ? 'Update faculty details'
                  : 'Create a new faculty'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveFaculty} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Faculty Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={facultyForm.name}
                  onChange={handleInputChange}
                  placeholder="Faculty of Engineering"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={facultyForm.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the faculty"
                />
              </div>

              <div>
                <Label htmlFor="campus">Campus (Optional)</Label>
                <Select
                  value={facultyForm.campus}
                  onValueChange={(value) => setFacultyForm((prev) => ({ ...prev, campus: value }))}
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
                  {loading ? 'Saving...' : facultyForm.id ? 'Update' : 'Create'} Faculty
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyManagement;
