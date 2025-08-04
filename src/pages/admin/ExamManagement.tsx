
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ExamManagementComponent from '@/components/admin/ExamManagement';

const ExamManagementPage = () => {
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <ExamManagementComponent />
      </div>
    </DashboardLayout>
  );
};

export default ExamManagementPage;
