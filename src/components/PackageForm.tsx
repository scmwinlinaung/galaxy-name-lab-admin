import { useState, useEffect } from 'react';
import { Package, CreatePackageRequest, CategoryCode, SubmissionValue, SubmissionRange } from '../models/Package';
import { packageService } from '../services/packageService';
import { X, Save } from 'lucide-react';
import { Button, Input, FormField } from '../widgets';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PackageFormProps {
  package?: Package;
  onClose: () => void;
  onSave: (packageItem: Package) => void;
}

const initialFormData = {
  categoryCode: 'BUSINESS' as CategoryCode,
  categoryName: 'Business Naming Solutions',
  path: {
    code: '',
    name: '',
    description: ''
  },
  plan: {
    code: '',
    name: '',
    isPopular: false
  },
  price: {
    amount: 0,
    currency: 'USD'
  },
  deliverables: {
    generatedNames: 0
  },
  submissionPolicy: {
    totalSubmissions: 0 as SubmissionValue | SubmissionRange,
    maxNamesPerSubmission: 0 as SubmissionValue | SubmissionRange,
    submissionFormat: '',
    submissionWindowDays: 0
  },
  expectedOutcome: '',
  description: '',
  displayOrder: 0,
  active: true
};

export function PackageForm({ package: packageItem, onClose, onSave }: PackageFormProps) {
  const [formData, setFormData] = useState(initialFormData);
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
        categoryCode: packageItem.categoryCode || 'BUSINESS',
        categoryName: packageItem.categoryName || '',
        path: {
          code: packageItem.path?.code || '',
          name: packageItem.path?.name || '',
          description: packageItem.path?.description || ''
        },
        plan: {
          code: packageItem.plan?.code || '',
          name: packageItem.plan?.name || '',
          isPopular: packageItem.plan?.isPopular || false
        },
        price: {
          amount: packageItem.price?.amount || 0,
          currency: packageItem.price?.currency || 'USD'
        },
        deliverables: {
          generatedNames: packageItem.deliverables?.generatedNames || 0
        },
        submissionPolicy: {
          totalSubmissions: packageItem.submissionPolicy?.totalSubmissions || 0,
          maxNamesPerSubmission: packageItem.submissionPolicy?.maxNamesPerSubmission || 0,
          submissionFormat: packageItem.submissionPolicy?.submissionFormat || '',
          submissionWindowDays: packageItem.submissionPolicy?.submissionWindowDays || 0
        },
        expectedOutcome: packageItem.expectedOutcome || '',
        description: packageItem.description || '',
        displayOrder: packageItem.displayOrder ?? 0,
        active: packageItem.active ?? true
      });
    }
  }, [packageItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (section: 'path' | 'plan' | 'price' | 'deliverables' | 'submissionPolicy', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const submissionValueToString = (value: SubmissionValue | SubmissionRange): string => {
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      const min = value.min !== undefined ? value.min : '';
      const max = value.max !== undefined ? value.max : '';
      if (min && max) {
        return `${min}-${max}`;
      }
      if (min) return min.toString();
      if (max) return max.toString();
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const packageId = packageItem?.id || packageItem?._id;

    if (packageId) {
      setUpdateDialog({
        isOpen: true,
        packageName: formData.categoryName || 'this package'
      });
      return;
    }

    proceedWithSave();
  };

  const proceedWithSave = async () => {
    setLoading(true);
    setError('');

    try {
      const packageData = { ...formData };

      let savedPackage: Package;

      const packageId = packageItem?.id || packageItem?._id;

      if (packageId) {
        setIsUpdating(true);
        savedPackage = await packageService.updatePackage(packageId, packageData);
      } else {
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <button type="button" onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

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

                {/* Category Code */}
                <FormField label="Category Code" required>
                  <select
                    id="categoryCode"
                    name="categoryCode"
                    value={formData.categoryCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="PERSONAL">PERSONAL</option>
                  </select>
                </FormField>

                {/* Category Name */}
                <FormField label="Category Name" required>
                  <Input
                    type="text"
                    id="categoryName"
                    name="categoryName"
                    required
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    placeholder="e.g., Business Naming Solutions"
                  />
                </FormField>

                {/* Description */}
                <div className="md:col-span-2">
                  <FormField label="Description" required>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe what this package includes..."
                    />
                  </FormField>
                </div>

                {/* Expected Outcome */}
                <div className="md:col-span-2">
                  <FormField label="Expected Outcome" required>
                    <textarea
                      id="expectedOutcome"
                      name="expectedOutcome"
                      rows={3}
                      value={formData.expectedOutcome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe what the customer can expect..."
                    />
                  </FormField>
                </div>

                {/* Display Order */}
                <FormField label="Display Order" required>
                  <Input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    required
                    min="0"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </FormField>

                {/* Active */}
                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Active Package
                  </label>
                </div>

                {/* Price Section */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Price</h4>
                </div>

                <FormField label="Amount" required>
                  <Input
                    type="number"
                    id="price-amount"
                    min="0"
                    step="0.01"
                    value={formData.price.amount}
                    onChange={(e) => handleNestedChange('price', 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="299.99"
                  />
                </FormField>

                <FormField label="Currency" required>
                  <Input
                    type="text"
                    id="price-currency"
                    value={formData.price.currency}
                    onChange={(e) => handleNestedChange('price', 'currency', e.target.value)}
                    placeholder="USD"
                  />
                </FormField>

                {/* Path Section */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Path</h4>
                </div>

                <FormField label="Path Code" required>
                  <Input
                    type="text"
                    value={formData.path.code}
                    onChange={(e) => handleNestedChange('path', 'code', e.target.value)}
                    placeholder="e.g., premium"
                  />
                </FormField>

                <FormField label="Path Name" required>
                  <Input
                    type="text"
                    value={formData.path.name}
                    onChange={(e) => handleNestedChange('path', 'name', e.target.value)}
                    placeholder="e.g., Premium Path"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Path Description" required>
                    <Input
                      type="text"
                      value={formData.path.description}
                      onChange={(e) => handleNestedChange('path', 'description', e.target.value)}
                      placeholder="e.g., Premium naming path"
                    />
                  </FormField>
                </div>

                {/* Plan Section */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Plan</h4>
                </div>

                <FormField label="Plan Code" required>
                  <Input
                    type="text"
                    value={formData.plan.code}
                    onChange={(e) => handleNestedChange('plan', 'code', e.target.value)}
                    placeholder="e.g., basic"
                  />
                </FormField>

                <FormField label="Plan Name" required>
                  <Input
                    type="text"
                    value={formData.plan.name}
                    onChange={(e) => handleNestedChange('plan', 'name', e.target.value)}
                    placeholder="e.g., Basic Plan"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.plan.isPopular}
                      onChange={(e) => handleNestedChange('plan', 'isPopular', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Popular Plan
                    </span>
                  </label>
                </div>

                {/* Deliverables Section */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Deliverables</h4>
                </div>

                <FormField label="Generated Names Count" required>
                  <Input
                    type="number"
                    id="generatedNames"
                    min="0"
                    value={formData.deliverables.generatedNames}
                    onChange={(e) => handleNestedChange('deliverables', 'generatedNames', parseFloat(e.target.value) || 0)}
                    placeholder="5"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Number of names to generate
                  </p>
                </FormField>

                {/* Submission Policy Section */}
                <div className="space-y-6 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">Submission Policy</h4>
                </div>

                <FormField label="Total Submissions" required>
                  <Input
                    type="text"
                    id="totalSubmissions"
                    value={submissionValueToString(formData.submissionPolicy.totalSubmissions)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = parseFloat(value);
                      handleNestedChange('submissionPolicy', 'totalSubmissions', isNaN(numValue) ? value : numValue);
                    }}
                    placeholder="e.g., 5 or 1-5"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Can be a number or range (e.g., "5" or "1-5")
                  </p>
                </FormField>

                <FormField label="Max Names Per Submission" required>
                  <Input
                    type="text"
                    id="maxNamesPerSubmission"
                    value={submissionValueToString(formData.submissionPolicy.maxNamesPerSubmission)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = parseFloat(value);
                      handleNestedChange('submissionPolicy', 'maxNamesPerSubmission', isNaN(numValue) ? value : numValue);
                    }}
                    placeholder="e.g., 10 or 5-10"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Can be a number or range (e.g., "10" or "5-10")
                  </p>
                </FormField>

                <FormField label="Submission Format" required>
                  <Input
                    type="text"
                    id="submissionFormat"
                    value={formData.submissionPolicy.submissionFormat}
                    onChange={(e) => handleNestedChange('submissionPolicy', 'submissionFormat', e.target.value)}
                    placeholder="e.g., PDF, Excel"
                  />
                </FormField>

                <FormField label="Submission Window (Days)" required>
                  <Input
                    type="number"
                    id="submissionWindowDays"
                    min="0"
                    value={formData.submissionPolicy.submissionWindowDays}
                    onChange={(e) => handleNestedChange('submissionPolicy', 'submissionWindowDays', parseFloat(e.target.value) || 0)}
                    placeholder="7"
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button type="button" onClick={onClose} variant="secondary">
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
