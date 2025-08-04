
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CommunityManagementComponent from '@/components/admin/CommunityManagement';

const CommunityManagementPage = () => {
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
          <p className="text-gray-600">Manage external community platforms and groups</p>
        </div>
        
        <CommunityManagementComponent />
      </div>
    </DashboardLayout>
  );
};

export default CommunityManagementPage;
