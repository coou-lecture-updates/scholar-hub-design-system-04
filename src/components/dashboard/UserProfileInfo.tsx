
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
  <Card className="border-l-4 border-primary/60 bg-card shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        Your Profile Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userInfo.map((info, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-accent/30 border border-border/50 hover:border-primary/30 transition-all">
            <div className="flex-shrink-0 text-primary mt-1">
              {info.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">
                {info.label}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1 break-words">
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
