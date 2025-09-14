import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Key, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const SecurityStatusDashboard = () => {
  const securityFeatures = [
    {
      name: 'Anonymous System Privacy',
      status: 'protected',
      description: 'Email addresses hidden from public view',
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: 'Role Escalation Prevention',
      status: 'protected',
      description: 'Users cannot modify their own roles',
      icon: <Lock className="h-4 w-4" />
    },
    {
      name: 'System Settings Security',
      status: 'protected',
      description: 'Admin-only access to sensitive settings',
      icon: <Key className="h-4 w-4" />
    },
    {
      name: 'Audit Logging',
      status: 'active',
      description: 'All sensitive operations logged',
      icon: <Activity className="h-4 w-4" />
    },
    {
      name: 'Payment Gateway Security',
      status: 'enhanced',
      description: 'Secret keys secured in Edge Functions',
      icon: <Shield className="h-4 w-4" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'protected':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Protected</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case 'enhanced':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">Enhanced</Badge>;
      default:
        return <Badge variant="destructive">Unknown</Badge>;
    }
  };

  const remainingWarnings = [
    {
      level: 'warning',
      title: 'Password Protection',
      description: 'Enable leaked password protection in Auth settings',
      action: 'Configure in Supabase Dashboard → Authentication → Settings'
    },
    {
      level: 'warning',
      title: 'Database Version',
      description: 'Postgres version has security patches available',
      action: 'Upgrade in Supabase Dashboard → Settings → Database'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Features Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {securityFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remaining Security Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Remaining Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {remainingWarnings.map((warning, index) => (
              <Alert key={index} className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="font-medium text-yellow-800">{warning.title}</div>
                  <div className="text-yellow-700 mt-1">{warning.description}</div>
                  <div className="text-sm text-yellow-600 mt-2 font-medium">{warning.action}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Security Implementation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Critical vulnerabilities have been addressed</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>RLS policies have been hardened and consolidated</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Payment gateway secrets are now secure</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Comprehensive audit logging is active</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Role escalation prevention is in place</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityStatusDashboard;