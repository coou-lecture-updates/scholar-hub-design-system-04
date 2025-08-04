import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, Key, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/useAuth';

const AdminSecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [mfaSetup, setMfaSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    if (!user?.id) return;
    
    try {
      // Use the edge function to check MFA status
      const { data, error } = await supabase.functions.invoke('check-mfa-status', {
        body: { userId: user.id }
      });
      
      if (!error && data) {
        setMfaEnabled(data.isEnabled || false);
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const setupMFA = async () => {
    if (!user?.id) return;
    
    setMfaLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-totp', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      setQrCodeUrl(data.qrCodeUrl);
      setTotpSecret(data.secret);
      setMfaSetup(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup MFA",
        variant: "destructive",
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!user?.id || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setMfaLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { token: verificationCode, userId: user.id }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setMfaEnabled(true);
        setMfaSetup(false);
        setVerificationCode('');
        
        toast({
          title: "Success",
          description: "MFA enabled successfully",
        });
      } else {
        toast({
          title: "Error", 
          description: "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify MFA",
        variant: "destructive",
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMFA = async () => {
    if (!user?.id) return;
    
    setMfaLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('disable-mfa', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setMfaEnabled(false);
        toast({
          title: "Success",
          description: "MFA disabled successfully",
        });
      } else {
        throw new Error(data.error || "Failed to disable MFA");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* MFA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
          </div>
          <CardDescription>
            Secure your account with time-based one-time passwords (TOTP)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaEnabled ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  MFA is currently enabled for your account
                </AlertDescription>
              </Alert>
              <Button 
                variant="destructive" 
                onClick={disableMFA}
                disabled={mfaLoading}
              >
                {mfaLoading ? "Disabling..." : "Disable MFA"}
              </Button>
            </div>
          ) : mfaSetup ? (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </AlertDescription>
              </Alert>
              
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="QR Code for MFA setup" className="border rounded" />
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-1">Manual entry key:</p>
                <code className="break-all">{totpSecret}</code>
              </div>
              
              <div className="space-y-2">
                <Label>Enter verification code from your app:</Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={verificationCode} 
                    onChange={setVerificationCode}
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
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={verifyAndEnableMFA} 
                  disabled={mfaLoading || verificationCode.length !== 6}
                >
                  {mfaLoading ? "Verifying..." : "Verify & Enable MFA"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setMfaSetup(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  MFA is not enabled. Enable it to add an extra layer of security to your account.
                </AlertDescription>
              </Alert>
              <Button onClick={setupMFA} disabled={mfaLoading}>
                {mfaLoading ? "Setting up..." : "Enable MFA"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecuritySettings;