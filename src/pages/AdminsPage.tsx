import { useState } from 'react';
import { Admin } from '../models/Admin';
import { AdminTableList } from '../components/AdminTableList';
import { AdminForm } from '../components/AdminForm';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function AdminsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedAdmin(undefined);
    setShowForm(true);
  };

  const handleResetPassword = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowResetForm(true);
  };

  const handleSave = () => {
    // Force refresh of the list
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setShowResetForm(false);
    setSelectedAdmin(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAdmin(undefined);
  };

  const handleCloseResetForm = () => {
    setShowResetForm(false);
    setSelectedAdmin(undefined);
  };

  return (
    <div className="min-h-screen">
      <AdminTableList
        key={refreshKey}
        onAdd={handleAdd}
        onResetPassword={handleResetPassword}
        onEdit={() => {}} // Admins don't need edit functionality in this context
      />

      {showForm && (
        <AdminForm
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {showResetForm && selectedAdmin && (
        <ResetPasswordForm
          admin={selectedAdmin}
          onClose={handleCloseResetForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default AdminsPage;