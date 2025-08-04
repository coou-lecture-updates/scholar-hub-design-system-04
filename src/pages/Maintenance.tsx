
import React from "react";
import { ShieldAlert } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4">
      <div className="p-8 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center max-w-sm">
        <ShieldAlert className="w-12 h-12 text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-blue-900">Maintenance Mode</h1>
        <p className="text-gray-700 mb-4 text-center">
          Our student portal is temporarily down for maintenance or updates.<br />
          We'll be back shortly! Please check again soon.
        </p>
        <p className="text-xs text-gray-400 mt-2">Only admins may access the portal right now.</p>
      </div>
    </div>
  );
}
