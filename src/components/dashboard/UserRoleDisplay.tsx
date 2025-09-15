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
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between">
        {userRoles.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {userRoles.map((role) => (
                <Badge key={role.id} variant={getRoleBadgeVariant(role.role)} className="text-xs">
                  {role.role.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Standard user</span>
          </div>
        )}

        {requestableRoles.length > 0 && (
          <div className="flex gap-1">
            {requestableRoles.map((role) => (
              <Button
                key={role}
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => requestRole(role)}
                disabled={requestingRole}
              >
                Request {role.replace('_', ' ')}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleDisplay;