
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Mail, Trash2, User as UserIcon } from "lucide-react";

interface UserTableProps {
  users: any[];
  userRoles: any[];
  getUserRole: (userId: string) => string;
  filteredUsers: any[];
  handleOpenDialog: (user?: any) => void;
  handleDeleteUser: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  getUserRole,
  handleOpenDialog,
  handleDeleteUser,
}) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Faculty/Department</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Campus</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.full_name || "Unnamed User"}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getUserRole(user.id) === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : getUserRole(user.id) === "moderator"
                      ? "bg-yellow-100 text-yellow-800"
                      : getUserRole(user.id) === "course_rep"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {getUserRole(user.id) === "admin"
                    ? "Admin"
                    : getUserRole(user.id) === "moderator"
                    ? "Moderator"
                    : getUserRole(user.id) === "course_rep"
                    ? "Course Rep"
                    : "User"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {user.faculty && <div>{user.faculty}</div>}
                  {user.department && (
                    <div className="text-xs text-gray-500">{user.department}</div>
                  )}
                  {!user.faculty && !user.department && (
                    <span className="text-gray-400">Not specified</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.level || <span className="text-gray-400">-</span>}
              </TableCell>
              <TableCell>
                {user.campus || (
                  <span className="text-gray-400">Not specified</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      (window.location.href = `mailto:${user.email}`)
                    }
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
