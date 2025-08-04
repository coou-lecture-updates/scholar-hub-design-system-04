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
import { Search, Plus, Edit, Trash2, Mail, User as UserIcon } from 'lucide-react';

import UserManagementHeader from './components/UserManagementHeader';
import UserDialog from './components/UserDialog';
import UserTable from './components/UserTable';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  const [userForm, setUserForm] = useState({
    id: '',
    full_name: '',
    email: '',
    selectedRole: 'user',
    faculty: '',
    department: '',
    level: '',
    campus: 'Uli',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (userError) throw userError;

      // Fetch user_roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      setUsers(userData || []);
      setUserRoles(rolesData || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserRole = (userId: string) => {
    const roleEntry = userRoles.find((r) => r.user_id === userId);
    return roleEntry?.role || 'user';
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        id: user.id,
        full_name: user.full_name || '',
        email: user.email || '',
        selectedRole: getUserRole(user.id),
        faculty: user.faculty || '',
        department: user.department || '',
        level: user.level?.toString() || '',
        campus: user.campus || 'Uli'
      });
    } else {
      setEditingUser(null);
      setUserForm({
        id: '',
        full_name: '',
        email: '',
        selectedRole: 'user',
        faculty: '',
        department: '',
        level: '',
        campus: 'Uli'
      });
    }
    setDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        ...userForm,
        level: userForm.level ? parseInt(userForm.level) : null,
      };
      if (editingUser) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            full_name: userData.full_name,
            faculty: userData.faculty,
            department: userData.department,
            level: userData.level,
            campus: userData.campus,
          })
          .eq('id', userData.id);
        if (userError) throw userError;

        const { data: hasRoleRow } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (hasRoleRow) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: userData.selectedRole })
            .eq('user_id', userData.id);
          if (roleError) throw roleError;
        } else {
          const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userData.id,
              role: userData.selectedRole,
            });
          if (roleInsertError) throw roleInsertError;
        }

        toast({
          title: "User updated",
          description: "User information and role have been updated successfully.",
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error saving user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.faculty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        {/* Move Dialog to wrap trigger and dialog content together */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <UserManagementHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddUser={() => setDialogOpen(true)}
          />
          <UserDialog
            open={dialogOpen}
            setOpen={setDialogOpen}
            editingUser={editingUser}
            userForm={userForm}
            setUserForm={setUserForm}
            loading={loading}
            handleSaveUser={handleSaveUser}
          />
        </Dialog>
        {loading && !users.length ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Users Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No users match "${searchTerm}"`
                : "No users have been added yet."}
            </p>
          </div>
        ) : (
          <UserTable
            users={users}
            userRoles={userRoles}
            getUserRole={getUserRole}
            filteredUsers={filteredUsers}
            handleOpenDialog={handleOpenDialog}
            handleDeleteUser={handleDeleteUser}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
