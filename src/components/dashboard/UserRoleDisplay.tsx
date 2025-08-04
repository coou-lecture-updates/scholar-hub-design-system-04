import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Crown, Users, AlertCircle } from 'lucide-react';

interface UserRole {
  id: string;
  role: string;
  level?: number;
  faculty_id?: string;
  department_id?: string;
  faculties?: { name: string };
  departments?: { name: string };
}

const UserRoleDisplay = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingRole, setRequestingRole] = useState(false);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          level,
          faculty_id,
          department_id,
          faculties(name),
          departments(name)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestRole = async (role: string) => {
    if (!user) return;
    
    setRequestingRole(true);
    try {
      // Mock role request - table doesn't exist yet
      toast({
        title: "Feature coming soon",
        description: "Role request functionality will be available in the next update",
      });
      /*
      const { error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user.id,
          requested_role: role,
          reason: `User ${userProfile?.full_name} has requested ${role} role`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Role request submitted",
        description: `Your request for ${role} role has been submitted to administrators`,
      });
      */
    } finally {
      setRequestingRole(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      case 'course_rep': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      case 'course_rep': return 'default';
      default: return 'outline';
    }
  };

  const availableRoles = ['course_rep', 'moderator'];
  const currentRoleNames = userRoles.map(r => r.role);
  const requestableRoles = availableRoles.filter(role => !currentRoleNames.includes(role));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading roles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Your Roles & Permissions
        </CardTitle>
        <CardDescription>
          Current roles and permissions assigned to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRoles.length > 0 ? (
          <div className="space-y-3">
            {userRoles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getRoleIcon(role.role)}
                  <div>
                    <Badge variant={getRoleBadgeVariant(role.role)}>
                      {role.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {role.role === 'course_rep' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.faculties?.name && `Faculty: ${role.faculties.name}`}
                        {role.departments?.name && ` • Department: ${role.departments.name}`}
                        {role.level && ` • Level: ${role.level}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">You have standard user permissions</p>
          </div>
        )}

        {requestableRoles.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Request Additional Roles
            </h4>
            <div className="space-y-2">
              {requestableRoles.map((role) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    <span className="capitalize">{role.replace('_', ' ')}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requestRole(role)}
                    disabled={requestingRole}
                  >
                    Request
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Role requests will be reviewed by administrators
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleDisplay;