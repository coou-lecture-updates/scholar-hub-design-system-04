
import { supabase } from './client';

/**
 * SECURITY WARNING: This function has been deprecated for security reasons.
 * Use the secure admin setup through Supabase Edge Functions instead.
 * @deprecated Use setupAdminSecure() instead
 */
export const createAdminUser = async () => {
  console.warn('DEPRECATED: createAdminUser() is deprecated for security reasons. Use setupAdminSecure() instead.');
  
  return { 
    success: false, 
    message: 'This function has been deprecated for security reasons. Please use the secure admin setup process.' 
  };
  
}

/**
 * Secure admin setup using Supabase Edge Functions
 * This function calls the secure admin setup endpoint
 */
export const setupAdminSecure = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-admin-secure');
    
    if (error) {
      console.error('Error setting up admin:', error);
      return { success: false, message: 'Error setting up admin', error: error.message };
    }
    
    return data;
  } catch (error) {
    console.error('Error setting up admin:', error);
    return { success: false, message: 'Error setting up admin', error };
  }
};

/**
 * Clears all users from the authentication system except for the admin
 * Use with caution - this is destructive
 */
export const clearAllUsers = async () => {
  try {
    // We can't directly delete users from auth.users, but we can delete them from our custom users table
    const { error } = await supabase
      .from('users')
      .delete()
      .neq('role', 'admin');
    
    if (error) throw error;
    
    return { success: true, message: 'All regular users have been removed from the users table' };
  } catch (error) {
    console.error('Error clearing users:', error);
    return { success: false, message: 'Error clearing users', error };
  }
};
