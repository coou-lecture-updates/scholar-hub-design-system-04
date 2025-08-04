import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '@/contexts/auth/useAuth';

const MFARecoveryPanel = () => {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateRecoveryCodes = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Generate 10 recovery codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      
      // Store recovery codes in secure storage
      // For now, we'll show them to the user to save manually
      // In production, implement proper secure storage
      
      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
      
      toast({
        title: "Recovery codes generated",
        description: "Please save these codes in a secure location",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recovery codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const useRecoveryCode = async () => {
    if (!user?.id || !recoveryCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recovery code",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // For demo purposes, check against generated codes
      if (recoveryCodes.includes(recoveryCode.trim().toUpperCase())) {
        // Disable MFA by calling the disable function
        const { data, error } = await supabase.functions.invoke('disable-mfa', {
          body: { userId: user.id }
        });
        
        if (error) throw error;
        
        toast({
          title: "Recovery successful",
          description: "MFA has been disabled. Please set up new MFA.",
        });
        setRecoveryCode('');
        setRecoveryCodes(codes => codes.filter(c => c !== recoveryCode.trim().toUpperCase()));
      } else {
        toast({
          title: "Invalid recovery code",
          description: "The recovery code is invalid or has already been used",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to use recovery code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recovery Code Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>MFA Recovery</CardTitle>
          </div>
          <CardDescription>
            Use a recovery code to regain access if you've lost your authenticator device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Recovery codes can only be used once. Using a recovery code will temporarily disable MFA.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="recovery-code">Recovery Code</Label>
            <Input
              id="recovery-code"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Enter your 6-character recovery code"
              maxLength={6}
            />
          </div>
          
          <Button onClick={useRecoveryCode} disabled={loading || !recoveryCode.trim()}>
            {loading ? "Using Recovery Code..." : "Use Recovery Code"}
          </Button>
        </CardContent>
      </Card>

      {/* Generate New Recovery Codes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Generate Recovery Codes</CardTitle>
          </div>
          <CardDescription>
            Generate new recovery codes for emergency access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showRecoveryCodes ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Save these recovery codes in a secure location. Each code can only be used once.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowRecoveryCodes(false)}
              >
                I've Saved These Codes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Recovery codes allow you to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>
              
              <Button onClick={generateRecoveryCodes} disabled={loading}>
                {loading ? "Generating..." : "Generate Recovery Codes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MFARecoveryPanel;