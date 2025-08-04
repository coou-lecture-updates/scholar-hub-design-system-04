
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EnhancedDepartmentManagement from '@/components/admin/EnhancedDepartmentManagement';

const DepartmentManagement = () => {
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-8">
        <EnhancedDepartmentManagement />
      </div>
    </DashboardLayout>
  );
};

export default DepartmentManagement;
