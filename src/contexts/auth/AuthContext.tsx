
import React, { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchUserRole,
  fetchUserProfile,
  createUserProfileFromMetadata,
  UserProfile,
} from './authHelpers';

// Context props
interface AuthContextProps {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    campus?: string,
    faculty?: string,
    department?: string,
    level?: number,
    phone?: string,
    regNumber?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (user) {
      setProfileLoading(true);
      setUserProfile(await fetchUserProfile(user.id));
      setProfileLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setProfileLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      if (error) throw error;
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      await refreshProfile();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const lowered = typeof event === 'string' ? event.toLowerCase() : '';
          if (lowered.includes('sign') || lowered.includes('confirm')) {
            setTimeout(async () => {
              setUserProfile(await createUserProfileFromMetadata(currentSession.user));
            }, 0);
          } else {
            setTimeout(async () => {
              setUserProfile(await fetchUserProfile(currentSession.user.id));
            }, 100);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );
    // Get initial session (AFTER listener)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        refreshProfile();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.user?.id;
      let highestRole = 'user';
      if (userId) {
        highestRole = await fetchUserRole(userId);
      }

      toast({
        title: "Login successful",
        description: "Welcome back to COOU School Updates",
      });

      // Always redirect to user dashboard for regular login
      // Admins should use /admin-login for admin access
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    campus?: string,
    faculty?: string,
    department?: string,
    level?: number,
    phone?: string,
    regNumber?: string
  ) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            campus,
            faculty,
            department,
            level,
            phone,
            reg_number: regNumber
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            full_name: fullName,
            email,
            campus,
            faculty,
            department,
            level,
            phone,
            reg_number: regNumber,
            role: 'user'
          });
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account before signing in.",
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      signIn,
      signUp,
      signOut,
      loading,
      profileLoading,
      forgotPassword,
      resetPassword,
      refreshProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
