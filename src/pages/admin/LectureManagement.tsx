
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LectureForm } from '@/components/admin/LectureForm';
import { LectureList } from '@/components/admin/LectureList';
import { useLectureManagement } from '@/hooks/useLectureManagement';
import RoleBasedAccess from '@/components/RoleBasedAccess';

const LectureManagement = () => {
  const {
    lectures,
    loading,
    showForm,
    setShowForm,
    editingLecture,
    formData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleInputChange,
    handleCancel
  } = useLectureManagement();

  return (
    <DashboardLayout role="admin">
      {/* Place LectureForm as a global modal here */}
      <RoleBasedAccess allowedRoles={['admin', 'course_rep']}>
        <LectureForm
          open={showForm}
          onClose={() => setShowForm(false)}
          formData={formData}
          loading={loading}
          editingLecture={editingLecture}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </RoleBasedAccess>
      {/* Page Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Lecture Management</h1>
            <p className="text-gray-600">Manage lecture schedules and timetables</p>
          </div>
          <RoleBasedAccess allowedRoles={['admin', 'course_rep']}>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lecture
            </Button>
          </RoleBasedAccess>
        </div>
        <LectureList
          lectures={lectures}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default LectureManagement;

