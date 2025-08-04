
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useRoleCheck = (allowedRoles: string[]) => {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setHasRole(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if user has any of the allowed roles
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking user roles:', error);
          setHasRole(false);
          return;
        }

        const userRolesList = userRoles?.map(r => r.role) || [];
        
        // Check if user has any of the allowed roles
        const hasAnyRole = allowedRoles.some(role => 
          userRolesList.includes(role) || role === 'all'
        );
        
        setHasRole(hasAnyRole);
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, allowedRoles]);

  return { hasRole, loading };
};
