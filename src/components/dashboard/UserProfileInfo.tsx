
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, FileText, MessageSquare, User } from "lucide-react";

interface UserInfoItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface Props {
  userInfo: UserInfoItem[];
}

const UserProfileInfo: React.FC<Props> = ({ userInfo }) => (
  <Card className="border-l-4 border-purple-300 bg-white mb-2">
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userInfo.map((info, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border">
            <div className="flex-shrink-0 text-purple-600 mt-1">
              {info.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-500 tracking-wider font-bold">
                {info.label}
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {info.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default UserProfileInfo;
