
import React, { useState } from 'react';
// Remove duplicate useState import
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

// Remove duplicate useState import
// import { useState } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string>(""); // Placeholder for the real secret assignment
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper to check admin role from user_roles (secure)
  const checkIfAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');
    return !!(data && data.length > 0 && !error);
  };

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setTempUserId(null);

    try {
      setLoading(true);
      // Step 1: Authenticate user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error('User ID not found');

      // Step 2: Check if admin using user_roles (never users.role!)
      const isAdmin = await checkIfAdmin(userId);
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 3: Simulate 2FA/MFA step (for real TOTP, see comment below)
      setTempUserId(userId);
      setShowMfa(true);

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Real TOTP verification using Supabase Edge Function
  const verifyTotpCode = async (code: string, userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { token: code, userId: userId }
      });
      
      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  };

  const handleCompleteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setLoading(true);

    if (mfaCode.length === 6 && tempUserId) {
      // Check if user has TOTP enabled via edge function
      const { data: mfaStatus } = await supabase.functions.invoke('check-mfa-status', {
        body: { userId: tempUserId }
      });

      // If no TOTP setup, allow temporary bypass with warning
      if (!mfaStatus?.isEnabled) {
        if (mfaCode === '123456') {
          toast({
            title: "Temporary Access Granted",
            description: "Please set up MFA immediately in Security Settings",
            variant: "destructive",
          });
          navigate('/admin-dashboard');
          setLoading(false);
          return;
        } else {
          setMfaError('MFA not set up. Use temporary code 123456 and configure MFA immediately.');
          setLoading(false);
          return;
        }
      }

      // Verify real TOTP code
      const isValid = await verifyTotpCode(mfaCode, tempUserId);
      
      if (isValid) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        navigate('/admin-dashboard');
      } else {
        setMfaError('Invalid verification code. Please try again or contact your administrator.');
      }
    } else {
      setMfaError('Please enter a valid 6-digit code.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/ccb05f00-6c7e-42c9-9f90-8a499a5fdbfa.png" 
              alt="COOU Logo"
              className="h-16 w-16" 
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          </div>
          <p className="text-gray-600">
            {showMfa ? 'Enter verification code' : 'Administrative Dashboard'}
          </p>
        </div>

        {showMfa ? (
          <form onSubmit={handleCompleteLogin} className="space-y-6">
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-full flex flex-col items-center">
                <Lock className="h-12 w-12 text-blue-600 mb-2" />
                <h3 className="text-lg font-bold mb-1">Two-Factor Authentication (TOTP)</h3>
              </div>

              <div className="w-full flex flex-col items-center gap-2 my-3">
                <InputOTP 
                  maxLength={6} 
                  value={mfaCode} 
                  onChange={setMfaCode}
                  className="justify-center"
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <small className="text-gray-600 text-xs pb-1">
                  Enter the code from your Authenticator App (TOTP).
                </small>
                {mfaError && (
                  <p className="text-sm text-red-600 mt-1">{mfaError}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowMfa(false)}
              >
                Go back to login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleInitialLogin} className="space-y-6">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Sign in"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Return to regular login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
