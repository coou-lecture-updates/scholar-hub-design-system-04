import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock, User } from 'lucide-react';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { formatDistanceToNow } from 'date-fns';

const SecurityAuditPanel = () => {
  const { auditLogs, loading, error } = useSecurityAudit();

  const getActionColor = (action: string) => {
    if (action.includes('failed') || action.includes('error')) return 'destructive';
    if (action.includes('admin') || action.includes('role')) return 'secondary';
    return 'default';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('admin') || action.includes('role')) return <Shield className="h-4 w-4" />;
    if (action.includes('failed') || action.includes('error')) return <AlertTriangle className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load audit logs: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <CardDescription>
          Recent security events and administrative actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No audit logs found
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getActionIcon(log.action)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-gray-600">{log.table_name}</span>
                    </div>
                    {log.new_values && (
                      <div className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(log.new_values)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditPanel;