import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, UserCog, Trash2, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkActionsProps {
  selectedUsers: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedUsers,
  onClearSelection,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [processing, setProcessing] = useState(false);

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'course_rep', label: 'Course Rep' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' },
  ];

  const handleBulkRoleAssign = async () => {
    if (selectedUsers.length === 0) return;
    
    setProcessing(true);
    try {
      // Update or insert roles for all selected users
      for (const userId of selectedUsers) {
        const { data: existing } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existing) {
          await supabase
            .from('user_roles')
            .update({ role: selectedRole })
            .eq('user_id', userId);
        } else {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: selectedRole });
        }
      }

      toast({
        title: 'Roles Updated',
        description: `Successfully updated role to ${selectedRole} for ${selectedUsers.length} users.`,
      });

      setRoleDialogOpen(false);
      onClearSelection();
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update roles',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: 'Users Deleted',
        description: `Successfully deleted ${selectedUsers.length} users.`,
      });

      onClearSelection();
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete users',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = () => {
    const emails = selectedUsers.join(',');
    window.location.href = `mailto:?bcc=${emails}`;
    toast({
      title: 'Email Client Opened',
      description: `Ready to send email to ${selectedUsers.length} users.`,
    });
  };

  if (selectedUsers.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <Checkbox checked={true} className="mr-2" />
        <span className="text-sm font-medium">
          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
        </span>
        
        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={processing}>
              Bulk Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Assign Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleBulkDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to Users</DialogTitle>
            <DialogDescription>
              This will update the role for {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkRoleAssign} disabled={processing}>
              {processing ? 'Updating...' : 'Apply Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkActions;
