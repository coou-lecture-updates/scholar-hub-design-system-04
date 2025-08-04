import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Type for UserProfile (keep it consistent with app)
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  campus?: string;
  faculty?: string;
  department?: string;
  level?: number;
  role: string;
  reg_number?: string;
  phone?: string;
  avatar_url?: string;
}

// Highest role fetcher from user_roles table
export const fetchUserRole = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return 'user';
    }

    const roles = data?.map((row: { role: string }) => row.role) || [];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    if (roles.includes('course_rep')) return 'course_rep';
    return 'user';
  } catch (err) {
    console.error('Error in fetchUserRole:', err);
    return 'user';
  }
};

// User profile fetcher
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    const highestRole = await fetchUserRole(userId);
    return { ...(data as UserProfile), role: highestRole };
  } catch (error) {
    return null;
  }
};

// Profile creation from auth metadata
export const createUserProfileFromMetadata = async (authUser: User): Promise<UserProfile | null> => {
  try {
    const metadata = authUser.user_metadata || {};
    const profileData = {
      id: authUser.id,
      email: authUser.email!,
      full_name: metadata.full_name || '',
      campus: metadata.campus || '',
      faculty: metadata.faculty || '',
      department: metadata.department || '',
      level: metadata.level ? parseInt(metadata.level) : null,
      phone: metadata.phone || '',
      reg_number: metadata.reg_number || '',
      role: 'user'
    };
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .single();
    if (!existingProfile) {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      if (!error && data) return data as UserProfile;
      return null;
    } else {
      return await fetchUserProfile(authUser.id);
    }
  } catch {
    return null;
  }
};
