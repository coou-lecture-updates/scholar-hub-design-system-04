
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  editingUser: any;
  userForm: any;
  setUserForm: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  handleSaveUser: (e: React.FormEvent) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  setOpen,
  editingUser,
  userForm,
  setUserForm,
  loading,
  handleSaveUser,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserForm((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogDescription>
          {editingUser ? "Update user information." : "Add a new user to the system."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSaveUser} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <Input
            id="full_name"
            name="full_name"
            value={userForm.full_name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            disabled={!!editingUser}
          />
          {editingUser && (
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          )}
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <Select
            value={userForm.selectedRole}
            onValueChange={(value) => handleSelectChange("selectedRole", value)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="course_rep">Course Rep</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
              Faculty
            </label>
            <Input
              id="faculty"
              name="faculty"
              value={userForm.faculty}
              onChange={handleInputChange}
              placeholder="Enter faculty"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <Input
              id="department"
              name="department"
              value={userForm.department}
              onChange={handleInputChange}
              placeholder="Enter department"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Level
            </label>
            <Input
              id="level"
              name="level"
              type="number"
              value={userForm.level}
              onChange={handleInputChange}
              placeholder="Enter level (e.g., 100)"
            />
          </div>
          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-gray-700">
              Campus
            </label>
            <Select
              value={userForm.campus}
              onValueChange={(value) => handleSelectChange("campus", value)}
            >
              <SelectTrigger id="campus">
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uli">Uli</SelectItem>
                <SelectItem value="Igbariam">Igbariam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? "Saving..." : editingUser ? "Update User" : "Add User"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default UserDialog;
