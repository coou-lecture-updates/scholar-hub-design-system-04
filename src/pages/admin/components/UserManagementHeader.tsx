
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserManagementHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onAddUser: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onAddUser,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
      <p className="text-gray-600">View and manage user accounts and roles</p>
    </div>
    <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:items-center">
      <div className="relative w-full md:w-64 mt-4 md:mt-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button
        className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800 flex items-center ml-0 md:ml-4"
        onClick={onAddUser}
        type="button"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  </div>
);

export default UserManagementHeader;
