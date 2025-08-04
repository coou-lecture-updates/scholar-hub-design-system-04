
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

const SystemReportsPage = () => {
  const [fileStats, setFileStats] = useState({ count: 0, totalSize: 0, recent: [] as any[] });
  const [systemHealth, setSystemHealth] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    // File Uploads
    const { data: allFiles, error: fileErr } = await supabase.from('file_uploads').select('*').order('created_at', { ascending: false }).limit(20);
    const { count, error: countErr } = await supabase.from('file_uploads').select('*', { count: 'exact', head: true });
    // System Healths
    const { data: healths, error: healthsError } = await supabase.from('system_health').select('*').order('recorded_at', { ascending: false }).limit(10);
    // Audit logs
    const { data: audits, error: auditsError } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);

    setFileStats({
      count: count || 0,
      totalSize: (allFiles || []).reduce((a, f) => a + (f.file_size || 0), 0),
      recent: allFiles || [],
    });
    setSystemHealth(healths || []);
    setAuditLogs(audits || []);
    setLoading(false);
  };

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">System Reports</h1>
        {loading ? (
          <div className="text-center">Loading system info…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>File Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">Files: <b>{fileStats.count}</b></div>
                <div className="mb-4">Total Size: <b>{(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB</b></div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileStats.recent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">No file uploads found.</TableCell>
                      </TableRow>
                    ) : (
                      fileStats.recent.map((f: any) => (
                        <TableRow key={f.id}>
                          <TableCell>{f.original_filename}</TableCell>
                          <TableCell>{(f.file_size / 1024).toFixed(1)} KB</TableCell>
                          <TableCell>{f.user_id || '-'}</TableCell>
                          <TableCell>{new Date(f.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemHealth.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">No system health data found.</TableCell>
                      </TableRow>
                    ) : (
                      systemHealth.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.metric_name}</TableCell>
                          <TableCell>{m.metric_value} {m.metric_unit || ''}</TableCell>
                          <TableCell>{m.status || '-'}</TableCell>
                          <TableCell>{new Date(m.recorded_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Audit Logs */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">No audit logs found.</TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell>{l.action}</TableCell>
                          <TableCell>{l.table_name}</TableCell>
                          <TableCell>{l.user_id || '-'}</TableCell>
                          <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SystemReportsPage;
