import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const DashboardHeader = ({ fullName }: { fullName?: string }) => {
  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome Back{fullName ? `, ${fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening in your academic journey</p>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;
