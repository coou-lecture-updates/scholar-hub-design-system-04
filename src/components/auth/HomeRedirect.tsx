import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';

const HomeRedirect = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Always redirect to user dashboard from home
  // Admins should access admin panel via /admin-login
  return <Navigate to="/dashboard" replace />;
};

export default HomeRedirect;
