
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FacultyManager from '@/components/admin/FacultyManagement';

const FacultyManagement = () => {
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-8">
        <FacultyManager />
      </div>
    </DashboardLayout>
  );
};

export default FacultyManagement;
