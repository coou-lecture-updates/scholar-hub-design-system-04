import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = [
  { id: 100, name: "100 Level" },
  { id: 200, name: "200 Level" },
  { id: 300, name: "300 Level" },
  { id: 400, name: "400 Level" },
  { id: 500, name: "500 Level" },
  { id: 600, name: "600 Level" },
  { id: 700, name: "700 Level (Postgraduate)" },
];

const ProfileInfoForm = ({ profile, onUpdate, refreshProfile, user }: any) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    campus: profile?.campus ?? "",
    faculty: profile?.faculty ?? "",
    department: profile?.department ?? "",
    level: profile?.level ?? 0,
    phone: profile?.phone ?? "",
    reg_number: profile?.reg_number ?? "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        campus: profile.campus ?? "",
        faculty: profile.faculty ?? "",
        department: profile.department ?? "",
        // Make sure only allowed LEVELS IDs are used; fall back to 0 if invalid
        level: LEVELS.map(l => l.id).includes(profile.level) ? profile.level : 0,
        phone: profile.phone ?? "",
        reg_number: profile.reg_number ?? "",
      });
    }
  }, [profile]);

  // ALLOW ONLY LEVEL SELECTION (no manual input)
  const handleLevelChange = (value: string) =>
    setFormData((prev: any) => {
      const parsed = parseInt(value, 10);
      // Only allow values from LEVELS
      return LEVELS.find(l => l.id === parsed)
        ? { ...prev, level: parsed }
        : prev;
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow editing phone/level, not reg_number, full_name, email, faculty, department, campus
    if (name !== 'phone' && name !== 'level') return;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to update your profile", variant: "destructive" });
      return;
    }
    try {
      setUpdating(true);
      await onUpdate({
        phone: formData.phone,
        level: formData.level,
      });
      await refreshProfile?.();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message || "Failed to update profile. Please try again.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleProfileUpdate}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" value={formData.full_name} disabled className="bg-gray-100" />
          <p className="text-xs text-gray-500">Name cannot be changed after signup.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" value={formData.email} disabled className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg_number">Registration Number</Label>
          <Input id="reg_number" name="reg_number" value={formData.reg_number} disabled className="bg-gray-100" />
          <p className="text-xs text-gray-500">Registration number cannot be changed after first save.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="campus">Campus</Label>
          <Input id="campus" value={formData.campus || "Not set"} disabled className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level?.toString() || ""} onValueChange={handleLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map(level => (
                <SelectItem key={level.id} value={level.id.toString()}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="faculty">Faculty</Label>
          <Input id="faculty" value={formData.faculty || "Not set"} disabled className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={formData.department || "Not set"} disabled className="bg-gray-100" />
        </div>
      </div>
      <Button type="submit" className="mt-6" disabled={updating}>
        {updating ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
};

export default ProfileInfoForm;
