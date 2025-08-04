
import React from "react";

const DashboardHeader = ({ fullName }: { fullName?: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome Back{fullName ? `, ${fullName.split(' ')[0]}` : ''}!
      </h1>
      <p className="text-gray-600">Here's what's happening in your academic journey</p>
    </div>
  );
};

export default DashboardHeader;
