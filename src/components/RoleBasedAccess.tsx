
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  allowedRoles, 
  children, 
  fallback,
  requireAuth = true 
}) => {
  const { user } = useAuth();
  const { hasRole, loading } = useRoleCheck(allowedRoles);

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You must be logged in to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  // If loading role check
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Check if user has any of the allowed roles
  const hasAccess = allowedRoles.includes('all') || hasRole;

  if (!hasAccess) {
    return fallback || (
      <Alert className="border-orange-200 bg-orange-50">
        <ShieldX className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          You don't have permission to access this feature. Required roles: {allowedRoles.join(', ')}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RoleBasedAccess;
