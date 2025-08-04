import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export const useSecurityAudit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAuditLogs = async (limit = 50) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (
    action: string,
    tableName: string,
    details?: any
  ) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action,
          table_name: tableName,
          new_values: details,
          user_id: user?.id
        });
    } catch (err) {
      console.error('Error logging security event:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
    logSecurityEvent
  };
};