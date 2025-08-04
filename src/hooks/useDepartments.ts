
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDepartments = (faculty?: string) => {
  return useQuery({
    queryKey: ['departments', faculty],
    queryFn: async () => {
      let q = supabase.from('departments').select('name');
      if (faculty) q = q.eq('faculty_id', faculty); // Optionally filter if you want, adjust logic as needed
      const { data, error } = await q;
      if (error) throw error;
      return data?.map(d => d.name) ?? [];
    },
    enabled: !!faculty,
  });
};
