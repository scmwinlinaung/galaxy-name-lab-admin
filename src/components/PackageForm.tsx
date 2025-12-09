import { useState, useEffect } from 'react';
import { Package, packageService, CreatePackageRequest } from '../services/packageService';
import { X, Save } from 'lucide-react';
import { Button, Input, FormField } from '../widgets';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PackageFormProps {
  package?: Package;
  onClose: () => void;
  onSave: (packageItem: Package) => void;
}

export function PackageForm({ package: packageItem, onClose, onSave }: PackageFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Business Naming Solutions',
    path: '',
    isPopular: false,
    deliverables: '',
    submissionLimit: 0,
    submissionDurationDays: 0,
    expectedOutcome: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateDialog, setUpdateDialog] = useState({
    isOpen: false,
    packageName: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (packageItem) {
      setFormData({
        name: packageItem.name || '',
        description: packageItem.description || '',
        price: packageItem.price || 0,
        image: packageItem.image || '',
        category: packageItem.category || 'Business Naming Solutions',
        path: packageItem.path || '',
        isPopular: packageItem.isPopular ?? false,
        deliverables: packageItem.deliverables || '',
        submissionLimit: packageItem.submissionLimit || 0,
        submissionDurationDays: packageItem.submissionDurationDays || 0,
        expectedOutcome: packageItem.expectedOutcome || '',
      });
    }
  }, [packageItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'price' || name === 'submissionLimit' || name === 'submissionDurationDays') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the correct package ID (handle both id and _id fields)
    const packageId = packageItem?.id || packageItem?._id;

    // Show confirmation dialog for updates
    if (packageId) {
      setUpdateDialog({
        isOpen: true,
        packageName: formData.name || 'this package'
      });
      return;
    }

    // For new packages, proceed directly
    proceedWithSave();
  };

  const proceedWithSave = async () => {
    setLoading(true);
    setError('');

    try {
      const packageData = {
        ...formData,
      };

      let savedPackage: Package;

      const packageId = packageItem?.id || packageItem?._id;

      if (packageId) {
        setIsUpdating(true);
        // Update existing package - ensure all required fields are included
        savedPackage = await packageService.updatePackage(packageId, packageData);
      } else {
        // Create new package
        const createData: CreatePackageRequest = packageData;
        savedPackage = await packageService.createPackage(createData);
      }

      onSave(savedPackage);
      onClose();
    } catch (err) {
      setError(packageItem ? 'Failed to update package. Please try again.' : 'Failed to create package. Please try again.');
      console.error('Save package error:', err);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const confirmUpdate = () => {
    setUpdateDialog({ isOpen: false, packageName: '' });
    proceedWithSave();
  };

  const closeUpdateDialog = () => {
    setUpdateDialog({ isOpen: false, packageName: '' });
  };

  const title = packageItem ? 'Edit Package' : 'Add New Package';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                </div>

                {/* Package Name */}
                <FormField
                  label="Package Name"
                  required
                >
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Business Naming"
                  />
                </FormField>

                {/* Category */}
                <FormField
                  label="Category"
                  required
                >
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Business Naming Solutions">Business Naming Solutions</option>
                    <option value="Brand Identity">Brand Identity</option>
                    <option value="Domain Services">Domain Services</option>
                    <option value="Premium Naming">Premium Naming</option>
                  </select>
                </FormField>

                {/* Price */}
                <FormField
                  label="Price ($)"
                  required
                >
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="299.99"
                  />
                </FormField>

                {/* Image URL */}
                <FormField
                  label="Image URL"
                >
                  <Input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </FormField>

                {/* Popular Package */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="isPopular"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Popular Package
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Popular packages will be featured prominently on the website
                  </p>
                </div>

                {/* Path */}
                <FormField
                  label="Package Path"
                  required
                >
                  <Input
                    type="text"
                    id="path"
                    name="path"
                    required
                    value={formData.path}
                    onChange={handleInputChange}
                    placeholder="premium-business-naming"
                  />
                </FormField>

                {/* Description */}
                <div className="md:col-span-2">
                  <FormField
                    label="Description"
                    required
                  >
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe what this package includes and its benefits..."
                    />
                  </FormField>
                </div>

                {/* Deliverables & Submission Details */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Deliverables & Submission Details</h4>
                </div>

                {/* Deliverables */}
                <div className="md:col-span-2">
                  <FormField
                    label="Deliverables"
                    required
                  >
                    <textarea
                      id="deliverables"
                      name="deliverables"
                      rows={3}
                      value={formData.deliverables}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="List what the customer will receive (e.g., 5 business name options, logo concepts, etc.)"
                    />
                  </FormField>
                </div>

                {/* Submission Limit */}
                <FormField
                  label="Submission Limit"
                  required
                >
                  <Input
                    type="number"
                    id="submissionLimit"
                    name="submissionLimit"
                    required
                    min="0"
                    value={formData.submissionLimit}
                    onChange={handleInputChange}
                    placeholder="5"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum number of revisions or submissions allowed
                  </p>
                </FormField>

                {/* Submission Duration */}
                <FormField
                  label="Submission Duration (Days)"
                  required
                >
                  <Input
                    type="number"
                    id="submissionDurationDays"
                    name="submissionDurationDays"
                    required
                    min="0"
                    value={formData.submissionDurationDays}
                    onChange={handleInputChange}
                    placeholder="7"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    How many days the submission process will take
                  </p>
                </FormField>

                {/* Expected Outcome */}
                <div className="md:col-span-2">
                  <FormField
                    label="Expected Outcome"
                    required
                  >
                    <textarea
                      id="expectedOutcome"
                      name="expectedOutcome"
                      rows={3}
                      value={formData.expectedOutcome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe what the customer can expect as the final result..."
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                icon={<Save className="h-4 w-4" />}
                iconPosition="left"
              >
                {packageItem ? 'Update Package' : 'Create Package'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Update Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={updateDialog.isOpen}
        onClose={closeUpdateDialog}
        onConfirm={confirmUpdate}
        title="Update Package"
        message={`Are you sure you want to update "${updateDialog.packageName}"? The changes will be applied immediately and will be visible to all users.`}
        type="update"
        confirmText="Update Package"
        cancelText="Cancel"
        isLoading={isUpdating}
      />
    </div>
  );
}