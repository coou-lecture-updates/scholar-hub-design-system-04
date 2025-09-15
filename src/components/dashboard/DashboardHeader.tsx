
import React from "react";
import { Button } from "@/components/ui/button";

const DashboardHeader = ({ fullName }: { fullName?: string }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome Back{fullName ? `, ${fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">Here's what's happening in your academic journey</p>
      </div>
      <Button 
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
        onClick={() => window.location.href = '/events'}
      >
        <span className="text-yellow-500 bg-yellow-500 text-black">COOU</span>
        <span className="ml-1 text-black">Updates</span>
      </Button>
    </div>
  );
};

export default DashboardHeader;
