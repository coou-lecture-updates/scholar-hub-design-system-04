
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [campus, setCampus] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [campusOptions, setCampusOptions] = useState<string[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch campus/faculty/department for dropdowns
  useEffect(() => {
    async function fetchData() {
      // Get unique campus list from faculties table
      const { data: facultiesData } = await supabase.from('faculties').select('name, campus');
      if (facultiesData) {
        // Collect unique campuses, faculties
        const campuses = [...new Set(facultiesData.map(f => f.campus).filter(Boolean))];
        setCampusOptions(campuses);

        // Collect all faculties initially (for dropdown base)
        setFacultyOptions([...new Set(facultiesData.map(f => f.name).filter(Boolean))]);
      }
    }
    fetchData();
  }, []);

  // When campus changes, update faculty options accordingly
  useEffect(() => {
    async function fetchFaculties() {
      if (!campus) {
        setFacultyOptions([]);
        return;
      }
      const { data: facultiesData } = await supabase.from('faculties').select('name, campus').eq('campus', campus);
      if (facultiesData) {
        setFacultyOptions(facultiesData.map(f => f.name));
      } else {
        setFacultyOptions([]);
      }
      setFaculty('');
      setDepartment('');
      setDepartmentOptions([]);
    }
    fetchFaculties();
  }, [campus]);

  // When faculty changes, update department options accordingly
  useEffect(() => {
    async function fetchDepartments() {
      if (!faculty) {
        setDepartmentOptions([]);
        return;
      }
      // fetch department by faculty name
      const { data: facultyRow } = await supabase.from('faculties').select('id').eq('name', faculty).maybeSingle();
      if (facultyRow) {
        // Get all departments matching this faculty id
        const { data: deptData } = await supabase.from('departments').select('name').eq('faculty_id', facultyRow.id);
        setDepartmentOptions(deptData?.map(d => d.name) ?? []);
      } else {
        setDepartmentOptions([]);
      }
      setDepartment('');
    }
    fetchDepartments();
  }, [faculty]);

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName || !campus || !faculty || !department || !level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            campus,
            faculty,
            department,
            level: parseInt(level)
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before signing in.",
      });

      // Redirect IMMEDIATELY after successful signup
      navigate('/login');
      
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/a50cb673-9a95-4e3a-8398-8206661d6f9a.png" 
              alt="COOU Logo" 
              className="h-16 w-16"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://portal.coou.edu.ng/Content/images/logo2.png";
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Join COOU</CardTitle>
          <CardDescription>Create your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Campus + Level Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campus">Campus</Label>
                <Select value={campus} onValueChange={setCampus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campusOptions.map((campus) =>
                      <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                    <SelectItem value="600">600 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Faculty dropdown */}
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={faculty} onValueChange={setFaculty} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {facultyOptions.map(option =>
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Department dropdown */}
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(option =>
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
