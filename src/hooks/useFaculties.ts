
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFaculties = () => {
  return useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faculties').select('name');
      if (error) throw error;
      return data?.map(f => f.name) ?? [];
    },
  });
};
