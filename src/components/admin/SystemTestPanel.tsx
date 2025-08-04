import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Loader2, TestTube } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'loading';
  message: string;
}

const SystemTestPanel: React.FC = () => {
  const { user } = useAuth();
  const { wallet, addTransaction, checkBalance } = useWallet();
  const { hasAccess, userRole } = useAdminAccess();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runSystemTests = async () => {
    setTesting(true);
    const results: TestResult[] = [];

    // Test 1: Authentication
    results.push({
      name: 'User Authentication',
      status: user ? 'pass' : 'fail',
      message: user ? `Authenticated as ${user.email}` : 'User not authenticated'
    });

    // Test 2: Role Access
    results.push({
      name: 'Admin/Moderator Access',
      status: hasAccess ? 'pass' : userRole === 'user' ? 'warning' : 'fail',
      message: hasAccess ? `Access granted (${userRole})` : `Limited access (${userRole || 'no role'})`
    });

    // Test 3: Wallet System
    results.push({
      name: 'Wallet System',
      status: wallet ? 'pass' : 'fail',
      message: wallet ? `Wallet loaded - Balance: ₦${wallet.balance.toLocaleString()}` : 'Wallet not loaded'
    });

    // Test 4: Database Connection
    try {
      const { data, error } = await supabase.from('system_settings').select('*').limit(1);
      results.push({
        name: 'Database Connection',
        status: error ? 'fail' : 'pass',
        message: error ? `Database error: ${error.message}` : 'Database connected successfully'
      });
    } catch (error: any) {
      results.push({
        name: 'Database Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`
      });
    }

    // Test 5: Event Creation Fee Setting
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'event_creation_fee')
        .single();
      
      results.push({
        name: 'Event Creation Fee Setting',
        status: data ? 'pass' : 'warning',
        message: data ? `Fee set to ₦${parseInt(data.value).toLocaleString()}` : 'Default fee will be used (₦2,000)'
      });
    } catch (error) {
      results.push({
        name: 'Event Creation Fee Setting',
        status: 'warning',
        message: 'Using default fee (₦2,000)'
      });
    }

    // Test 6: Wallet Balance Check
    if (wallet) {
      const canCreatePaidEvent = checkBalance(2000);
      results.push({
        name: 'Paid Event Creation Capability',
        status: canCreatePaidEvent ? 'pass' : 'warning',
        message: canCreatePaidEvent 
          ? 'Sufficient balance for paid event creation' 
          : 'Insufficient balance - fund wallet to create paid events'
      });
    }

    setTestResults(results);
    setTesting(false);

    // Show summary toast
    const passCount = results.filter(r => r.status === 'pass').length;
    const totalTests = results.length;
    
    toast({
      title: "System Test Complete",
      description: `${passCount}/${totalTests} tests passed`,
      variant: passCount === totalTests ? "default" : "destructive",
    });
  };

  const testWalletTransaction = async () => {
    if (!wallet) {
      toast({
        title: "Wallet Error",
        description: "Wallet not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Test small credit transaction
      await addTransaction(
        100,
        'credit',
        'System test transaction',
        `TEST_${Date.now()}`,
        undefined,
        { test: true }
      );
      
      toast({
        title: "Wallet Test Successful",
        description: "₦100 test credit added to your wallet",
      });
    } catch (error: any) {
      toast({
        title: "Wallet Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Warning</Badge>;
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          System Testing Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runSystemTests}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Run System Tests
          </Button>
          
          <Button 
            onClick={testWalletTransaction}
            variant="outline"
            disabled={!wallet || testing}
            className="gap-2"
          >
            Test Wallet Transaction
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Status Summary:</strong><br />
            • Authentication: {user ? '✅ Active' : '❌ Required'}<br />
            • Role: {userRole || 'user'} {hasAccess ? '(Admin Access)' : ''}<br />
            • Wallet: {wallet ? `₦${wallet.balance.toLocaleString()}` : '❌ Not loaded'}<br />
            • Paid Event Creation: {wallet && checkBalance(2000) ? '✅ Available' : '❌ Insufficient funds'}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SystemTestPanel;