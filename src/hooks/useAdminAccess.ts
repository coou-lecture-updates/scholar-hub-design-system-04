
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/roles';

interface AdminAccessCheck {
  hasAccess: boolean;
  userRole: AppRole | null;
  loading: boolean;
  error: string | null;
}

export const useAdminAccess = (requiredRole?: AppRole): AdminAccessCheck => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check user roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          throw roleError;
        }

        const roles = roleData?.map(r => r.role as AppRole) || [];
        
        // Determine highest role
        let highestRole: AppRole = 'user';
        if (roles.includes('admin')) highestRole = 'admin';
        else if (roles.includes('moderator')) highestRole = 'moderator';
        else if (roles.includes('course_rep')) highestRole = 'course_rep';

        setUserRole(highestRole);

        // Check access based on role hierarchy
        if (requiredRole) {
          const roleHierarchy: Record<AppRole, number> = {
            'user': 1,
            'course_rep': 2,
            'moderator': 3,
            'admin': 4
          };

          const userLevel = roleHierarchy[highestRole];
          const requiredLevel = roleHierarchy[requiredRole];
          setHasAccess(userLevel >= requiredLevel);
        } else {
          // If no specific role required, check if user has any admin-level role
          setHasAccess(['admin', 'moderator'].includes(highestRole));
        }

      } catch (error: any) {
        console.error('Error checking admin access:', error);
        setError(error.message || 'Failed to check access');
        setHasAccess(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, requiredRole]);

  return { hasAccess, userRole, loading, error };
};
