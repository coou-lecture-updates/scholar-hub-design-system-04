import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RoleRequestManagement from '@/components/admin/RoleRequestManagement';

const RoleManagement = () => {
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [roleForm, setRoleForm] = useState({
    id: '',
    user_id: '',
    role: 'user',
    faculty_id: '',
    department_id: '',
    level: ''
  });

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          level,
          user_id,
          faculty_id,
          department_id,
          users (id, email, full_name),
          faculties (id, name),
          departments (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error.message);
      toast({
        title: "Error fetching user roles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .order('full_name');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error.message);
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setFaculties(data || []);
    } catch (error: any) {
      console.error('Error fetching faculties:', error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setRoleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (role?: any) => {
    if (role) {
      // Edit mode
      setEditingRole(role);
      setRoleForm({
        id: role.id,
        user_id: role.user_id,
        role: role.role,
        faculty_id: role.faculty_id || '',
        department_id: role.department_id || '',
        level: role.level?.toString() || ''
      });
    } else {
      // Create mode
      setEditingRole(null);
      setRoleForm({
        id: '',
        user_id: '',
        role: 'user',
        faculty_id: '',
        department_id: '',
        level: ''
      });
    }
    
    setDialogOpen(true);
  };

  // Helper to check if a given user_id is the last admin in the database
  const isLastAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    if (error) return false;
    // Only 1 admin left and it's the one we want to delete
    if (data && data.length === 1 && data[0].user_id === userId) return true;
    return false;
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const roleData = {
        ...roleForm,
        level: roleForm.level ? parseInt(roleForm.level) : null
      };
      
      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({
            role: roleData.role,
            faculty_id: roleData.faculty_id || null,
            department_id: roleData.department_id || null,
            level: roleData.level
          })
          .eq('id', roleData.id);
        
        if (error) throw error;
        
        toast({
          title: "Role updated",
          description: "User role has been updated successfully.",
        });
      } else {
        // Check if user already has this role
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', roleData.user_id)
          .eq('role', roleData.role)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existingRole) {
          toast({
            title: "Role already exists",
            description: "This user already has this role assigned.",
            variant: "destructive",
          });
          setDialogOpen(false);
          return;
        }
        
        // Create new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: roleData.user_id,
            role: roleData.role,
            faculty_id: roleData.faculty_id || null,
            department_id: roleData.department_id || null,
            level: roleData.level
          });
        
        if (error) throw error;
        
        toast({
          title: "Role assigned",
          description: "User role has been assigned successfully.",
        });
      }
      
      setDialogOpen(false);
      fetchUserRoles();
    } catch (error: any) {
      console.error('Error saving role:', error.message);
      toast({
        title: "Error saving role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const roleToDelete = userRoles.find(r => r.id === roleId);

    // Prevent the only admin from removing their own admin role
    if (
      roleToDelete &&
      roleToDelete.role === 'admin' &&
      roleToDelete.user_id === user?.id
    ) {
      if (await isLastAdmin(user?.id)) {
        toast({
          title: "Action denied",
          description: "You cannot remove your own admin role as the last remaining admin. Please assign another admin before revoking your own access.",
          variant: "destructive",
        });
        return;
      }
    }
    if (!confirm('Are you sure you want to delete this role assignment? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
      
      toast({
        title: "Role deleted",
        description: "User role has been deleted successfully.",
      });
      
      fetchUserRoles();
    } catch (error: any) {
      console.error('Error deleting role:', error.message);
      toast({
        title: "Error deleting role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter user roles based on search term
  const filteredRoles = userRoles.filter(role => 
    role.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.faculties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.departments?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      case 'course_rep': return 'bg-green-100 text-green-800';
      case 'user': 
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Assign and manage user roles across the system</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800 flex items-center"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role Assignment' : 'Assign New Role'}</DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Update role information for this user.' : 'Assign a role to a user in the system.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">User</label>
                  {editingRole ? (
                    <Input
                      id="user_display"
                      value={users.find(u => u.id === roleForm.user_id)?.full_name || ''}
                      disabled
                    />
                  ) : (
                    <Select 
                      value={roleForm.user_id} 
                      onValueChange={(value) => handleSelectChange('user_id', value)}
                    >
                      <SelectTrigger id="user_id">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <Select 
                    value={roleForm.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="course_rep">Course Rep</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {roleForm.role === 'course_rep' && (
                  <>
                    <div>
                      <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">Faculty</label>
                      <Select 
                        value={roleForm.faculty_id} 
                        onValueChange={(value) => handleSelectChange('faculty_id', value)}
                      >
                        <SelectTrigger id="faculty_id">
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="">None</SelectItem>
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Department</label>
                      <Select 
                        value={roleForm.department_id} 
                        onValueChange={(value) => handleSelectChange('department_id', value)}
                      >
                        <SelectTrigger id="department_id">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="">None</SelectItem>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level</label>
                      <Input
                        id="level"
                        name="level"
                        type="number"
                        value={roleForm.level}
                        onChange={handleInputChange}
                        placeholder="Enter level (e.g., 100)"
                      />
                    </div>
                  </>
                )}
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={loading}>
                    {loading ? "Saving..." : editingRole ? "Update Role" : "Assign Role"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </div>
              <div className="relative w-full md:w-64 mt-4 md:mt-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !userRoles.length ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading user roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-10">
                <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Roles Found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No roles match "${searchTerm}"` 
                    : "No roles have been assigned yet."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                              {userRole.users?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium">{userRole.users?.full_name || 'Unnamed User'}</div>
                              <div className="text-xs text-gray-500">{userRole.users?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getRoleBadgeClass(userRole.role)
                          }`}>
                            {userRole.role === 'admin' ? 'Admin' : 
                             userRole.role === 'moderator' ? 'Moderator' :
                             userRole.role === 'course_rep' ? 'Course Rep' : 'User'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {userRole.faculties?.name || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>
                          {userRole.departments?.name || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>
                          {userRole.level || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(userRole)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteRole(userRole.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <RoleRequestManagement />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleManagement;
