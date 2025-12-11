import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, UserCheck, GraduationCap, Building2, Users, Crown, Settings, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserRole {
  id: string;
  role: string;
  level?: number;
  faculty_name?: string;
  department_name?: string;
}

interface RoleRequest {
  id: string;
  requested_role: string;
  status: string;
  created_at: string;
}

const UserRoleDisplay: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingRole, setRequestingRole] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [justification, setJustification] = useState('');
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRoles();
      fetchRoleRequests();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          level,
          faculties:faculty_id(name),
          departments:department_id(name)
        `)
        .eq('user_id', user!.id);

      if (error) throw error;

      const formattedRoles = data?.map(role => ({
        id: role.id,
        role: role.role,
        level: role.level,
        faculty_name: role.faculties?.name,
        department_name: role.departments?.name
      })) || [];

      setUserRoles(formattedRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your roles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('role_requests')
        .select('id, requested_role, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoleRequests(data || []);
    } catch (error) {
      console.error('Error fetching role requests:', error);
    }
  };

  const requestRole = async () => {
    if (!selectedRole || !justification.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a role and provide justification.",
        variant: "destructive"
      });
      return;
    }

    setRequestingRole(true);
    
    try {
      const { error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user!.id,
          requested_role: selectedRole,
          faculty_id: userProfile?.faculty ? await getFacultyId(userProfile.faculty) : null,
          department_id: userProfile?.department ? await getDepartmentId(userProfile.department) : null,
          level: userProfile?.level,
          justification: justification.trim()
        });

      if (error) throw error;

      toast({
        title: "Role Request Sent",
        description: `Your request for ${selectedRole === 'course_rep' ? 'Course Rep' : 'SUG Moderator'} has been sent to administrators.`,
      });

      setDialogOpen(false);
      setSelectedRole('');
      setJustification('');
      fetchRoleRequests();
    } catch (error) {
      console.error('Error submitting role request:', error);
      toast({
        title: "Error",
        description: "Failed to submit role request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRequestingRole(false);
    }
  };

  const getFacultyId = async (facultyName: string) => {
    const { data } = await supabase
      .from('faculties')
      .select('id')
      .eq('name', facultyName)
      .single();
    return data?.id;
  };

  const getDepartmentId = async (departmentName: string) => {
    const { data } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .single();
    return data?.id;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Crown;
      case 'moderator':
        return Shield;
      case 'course_rep':
        return Users;
      case 'sug_moderator':
        return UserCheck;
      default:
        return User;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'moderator':
        return 'secondary' as const;
      case 'course_rep':
        return 'default' as const;
      case 'sug_moderator':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  // Check if user has admin/moderator roles for dashboard switching
  const hasAdminRole = userRoles.some(role => role.role === 'admin');
  const hasModeratorRole = userRoles.some(role => ['course_rep', 'sug_moderator'].includes(role.role));

  // Available roles that can be requested
  const availableRoles = [
    { 
      name: 'Course Rep', 
      value: 'course_rep',
      description: 'Represent your course and students'
    },
    { 
      name: 'SUG Moderator', 
      value: 'sug_moderator',
      description: 'Help moderate student union activities'
    }
  ].filter(role => 
    !userRoles.some(userRole => userRole.role === role.value) &&
    !roleRequests.some(request => request.requested_role === role.value && request.status === 'pending')
  );

  return (
    <Card className="border-l-4 border-blue-300 bg-card mb-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-2 h-4 w-4 text-blue-600" />
            Your Roles & Permissions
          </div>
          {(hasAdminRole || hasModeratorRole) && (
            <Link to="/admin" className="text-xs text-blue-600 hover:text-blue-700 flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              Admin Dashboard
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {userRoles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {userRoles.map((role) => {
                  const IconComponent = getRoleIcon(role.role);
                  const badgeVariant = getRoleBadgeVariant(role.role);
                  
                  return (
                    <div key={role.id} className="p-2 border rounded bg-muted/50 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-foreground capitalize text-sm">
                            {role.role.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant={badgeVariant} className="text-xs px-2 py-0">
                          Active
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Standard User Permissions</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <Dialog key={role.value} open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRole(role.value);
                        setDialogOpen(true);
                      }}
                      className="text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Request {role.name}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request {role.name} Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="justification">Why do you want this role?</Label>
                        <Textarea
                          id="justification"
                          placeholder="Explain why you should be granted this role..."
                          value={justification}
                          onChange={(e) => setJustification(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setSelectedRole('');
                            setJustification('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={requestRole} disabled={requestingRole}>
                          {requestingRole ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            {roleRequests.length > 0 && (
              <div className="text-xs text-gray-500 space-y-1">
                {roleRequests.map((request) => (
                  <div key={request.id} className="flex justify-between">
                    <span>{request.requested_role.replace('_', ' ')} request:</span>
                    <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'} className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleDisplay;