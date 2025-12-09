import { useState } from 'react';
import { Package } from '../models/Package';
import { PackageTableList } from '../components/PackageTableList';
import { PackageForm } from '../components/PackageForm';

export function PackagesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingPackage(undefined);
    setShowForm(true);
  };

  const handleEdit = (packageItem: Package) => {
    setEditingPackage(packageItem);
    setShowForm(true);
  };

  const handleDelete = (_id: string) => {
    // Package is already deleted in PackageList component
    // Force refresh of the list
    setRefreshKey(prev => prev + 1);
  };

  const handleSave = (_packageItem: Package) => {
    // Package is already saved
    // Force refresh of the list
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setEditingPackage(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPackage(undefined);
  };

  return (
    <div className="min-h-screen">
      <PackageTableList
        key={refreshKey}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {showForm && (
        <PackageForm
          package={editingPackage}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default PackagesPage;