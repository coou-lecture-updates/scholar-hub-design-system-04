import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

// Campus data for COOU
const CAMPUSES = [
  { id: 'igbariam', name: 'Igbariam Campus' },
  { id: 'uli', name: 'Uli Campus' }
];

// Faculty data for COOU
const FACULTIES = {
  igbariam: [
    { id: 'agriculture', name: 'Faculty of Agriculture' },
    { id: 'arts', name: 'Faculty of Arts' },
    { id: 'education', name: 'Faculty of Education' },
    { id: 'engineering', name: 'Faculty of Engineering' },
    { id: 'law', name: 'Faculty of Law' },
    { id: 'management', name: 'Faculty of Management Sciences' },
    { id: 'social_sciences', name: 'Faculty of Social Sciences' }
  ],
  uli: [
    { id: 'biosciences', name: 'Faculty of Biosciences' },
    { id: 'health_sciences', name: 'Faculty of Health Sciences' },
    { id: 'physical_sciences', name: 'Faculty of Physical Sciences' },
    { id: 'pharmaceutical_sciences', name: 'Faculty of Pharmaceutical Sciences' }
  ]
};

// Departments by faculty
const DEPARTMENTS = {
  agriculture: [
    { id: 'agric_economics', name: 'Agricultural Economics & Extension' },
    { id: 'crop_science', name: 'Crop Science' },
    { id: 'animal_science', name: 'Animal Science' },
    { id: 'soil_science', name: 'Soil Science' }
  ],
  arts: [
    { id: 'english', name: 'English Language & Literature' },
    { id: 'history', name: 'History & International Studies' },
    { id: 'linguistics', name: 'Linguistics & Nigerian Languages' },
    { id: 'theatre_arts', name: 'Theatre Arts' },
    { id: 'philosophy', name: 'Philosophy' }
  ],
  education: [
    { id: 'adult_education', name: 'Adult Education' },
    { id: 'education_foundation', name: 'Educational Foundations' },
    { id: 'science_education', name: 'Science Education' },
    { id: 'vocational_education', name: 'Vocational Education' }
  ],
  engineering: [
    { id: 'civil_engineering', name: 'Civil Engineering' },
    { id: 'electrical_engineering', name: 'Electrical Engineering' },
    { id: 'mechanical_engineering', name: 'Mechanical Engineering' },
    { id: 'chemical_engineering', name: 'Chemical Engineering' }
  ],
  law: [
    { id: 'commercial_law', name: 'Commercial & Property Law' },
    { id: 'jurisprudence', name: 'Jurisprudence & Public Law' }
  ],
  management: [
    { id: 'accountancy', name: 'Accountancy' },
    { id: 'banking_finance', name: 'Banking & Finance' },
    { id: 'business_admin', name: 'Business Administration' },
    { id: 'marketing', name: 'Marketing' }
  ],
  social_sciences: [
    { id: 'economics', name: 'Economics' },
    { id: 'political_science', name: 'Political Science' },
    { id: 'psychology', name: 'Psychology' },
    { id: 'sociology', name: 'Sociology' },
    { id: 'mass_comm', name: 'Mass Communication' }
  ],
  biosciences: [
    { id: 'botany', name: 'Botany' },
    { id: 'microbiology', name: 'Microbiology' },
    { id: 'zoology', name: 'Zoology' }
  ],
  health_sciences: [
    { id: 'medical_laboratory', name: 'Medical Laboratory Science' },
    { id: 'nursing', name: 'Nursing Science' },
    { id: 'radiography', name: 'Radiography & Radiological Sciences' }
  ],
  physical_sciences: [
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'computer_science', name: 'Computer Science' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'statistics', name: 'Statistics' }
  ],
  pharmaceutical_sciences: [
    { id: 'clinical_pharmacy', name: 'Clinical Pharmacy' },
    { id: 'pharmaceutics', name: 'Pharmaceutics & Pharmaceutical Technology' },
    { id: 'pharmacology', name: 'Pharmacology & Toxicology' },
    { id: 'pharm_chem', name: 'Pharmaceutical & Medicinal Chemistry' }
  ]
};

// Levels common in Nigerian universities
const LEVELS = [
  { id: 100, name: '100 Level' },
  { id: 200, name: '200 Level' },
  { id: 300, name: '300 Level' },
  { id: 400, name: '400 Level' },
  { id: 500, name: '500 Level' },
  { id: 600, name: '600 Level' },
  { id: 700, name: '700 Level (Postgraduate)' }
];

import ProfileInfoForm from './user-settings/ProfileInfoForm';
import ChangePasswordForm from './user-settings/ChangePasswordForm';

const UserSettings = () => {
  const { userProfile, refreshProfile, updateProfile, loading, profileLoading, user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    campus: '',
    faculty: '',
    department: '',
    level: 0,
    phone: '',
    reg_number: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // State to handle dynamic dropdown options
  const [availableFaculties, setAvailableFaculties] = useState<Array<{id: string, name: string}>>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Array<{id: string, name: string}>>([]);

  // Load user data when component mounts or when userProfile changes
  useEffect(() => {
    const loadUserData = () => {
      console.log('Loading user data:', { userProfile, user });
      
      if (userProfile) {
        // Use userProfile data first (from database)
        setFormData({
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          campus: userProfile.campus || '',
          faculty: userProfile.faculty || '',
          department: userProfile.department || '',
          level: userProfile.level || 0,
          phone: userProfile.phone || '',
          reg_number: userProfile.reg_number || ''
        });
        
        // Set available faculties based on campus
        if (userProfile.campus) {
          setAvailableFaculties(FACULTIES[userProfile.campus as keyof typeof FACULTIES] || []);
        }
        
        // Set available departments based on faculty
        if (userProfile.faculty) {
          setAvailableDepartments(DEPARTMENTS[userProfile.faculty as keyof typeof DEPARTMENTS] || []);
        }
      } else if (user?.user_metadata) {
        // Fallback to user metadata if profile doesn't exist yet
        const metadata = user.user_metadata;
        setFormData({
          full_name: metadata.full_name || '',
          email: user.email || '',
          campus: metadata.campus || '',
          faculty: metadata.faculty || '',
          department: metadata.department || '',
          level: metadata.level ? parseInt(metadata.level) : 0,
          phone: metadata.phone || '',
          reg_number: metadata.reg_number || ''
        });
        
        // Set dropdowns based on metadata
        if (metadata.campus) {
          setAvailableFaculties(FACULTIES[metadata.campus as keyof typeof FACULTIES] || []);
        }
        if (metadata.faculty) {
          setAvailableDepartments(DEPARTMENTS[metadata.faculty as keyof typeof DEPARTMENTS] || []);
        }
      }
    };

    loadUserData();
  }, [userProfile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLevelChange = (value: string) => {
    setFormData(prev => ({ ...prev, level: parseInt(value) }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      
      // Only update editable fields: email, phone, reg_number, level
      const updateData = {
        phone: formData.phone,
        reg_number: formData.reg_number,
        level: formData.level
      };

      // Update email separately using Supabase auth if it's different
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) {
          throw new Error(`Email update failed: ${emailError.message}`);
        }
        
        toast({
          title: "Email update initiated",
          description: "Please check your new email address for confirmation",
        });
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated",
      });
      
      // Refresh profile data
      if (refreshProfile) {
        await refreshProfile();
      }
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // In a real app, you'd verify the current password before changing
      // This is simplified for demonstration
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  if (loading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <img 
                  src="/lovable-uploads/a34f47d0-282f-46f8-81d5-70c52d2809b3.png" 
                  alt="COOU Logo" 
                  className="h-16 w-auto mb-4"
                />
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" id="user-settings-page">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileInfoForm
              profile={userProfile}
              onUpdate={updateProfile}
              refreshProfile={refreshProfile}
              user={user}
            />
          </TabsContent>
          <TabsContent value="security">
            <ChangePasswordForm user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
export default UserSettings;
