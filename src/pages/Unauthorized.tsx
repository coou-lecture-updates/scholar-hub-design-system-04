import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth/useAuth';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12" id="unauthorized-page">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <div className="bg-red-100 p-6 rounded-full">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h1>
        
        <p className="mt-4 text-gray-600">
          You don't have permission to access this page. If you believe this is an error, 
          please contact the administrator.
        </p>
        
        <div className="mt-8 space-y-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <Button className="w-full bg-green-700 hover:bg-green-800">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500 pt-4">
                Not signed in?{' '}
                <Link to="/login" className="text-green-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
