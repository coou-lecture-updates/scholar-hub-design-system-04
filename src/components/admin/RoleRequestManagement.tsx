import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, X, Clock, AlertTriangle } from 'lucide-react';

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users: {
    full_name: string;
    email: string;
  };
}

const RoleRequestManagement = () => {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      // For now, use a mock since role_requests table doesn't exist yet
      // In production, uncomment the real implementation below
      setRequests([]);
      /*
      const { data, error } = await supabase
        .from('role_requests')
        .select(`
          *,
          users(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      */
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch role requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      if (action === 'approve') {
        // Add role to user_roles table (mock implementation)
        toast({
          title: "Feature coming soon",
          description: "Role approval functionality will be available in the next update",
        });
        return;
        /*
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: request.user_id,
            role: request.requested_role
          });

        if (roleError) throw roleError;
        */
      }

      // Mock update for now since table doesn't exist
      toast({
        title: "Feature coming soon",
        description: "Role request management will be available in the next update",
      });
      /*
      // Update request status
      const { error: updateError } = await supabase
        .from('role_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: `Request ${action}d`,
        description: `Role request has been ${action}d successfully`,
      });
      */

      fetchRoleRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-50 text-green-700"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'moderator':
        return <Badge variant="secondary">Moderator</Badge>;
      case 'course_rep':
        return <Badge variant="default">Course Rep</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredRequests = requests.filter(request =>
    request.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requested_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading role requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Role Requests
        </CardTitle>
        <CardDescription>
          Review and manage user role requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No role requests found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.users.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.users.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(request.requested_role)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.reason}>
                        {request.reason || 'No reason provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleRequest(request.id, 'approve')}
                            disabled={processingId === request.id}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequest(request.id, 'reject')}
                            disabled={processingId === request.id}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleRequestManagement;