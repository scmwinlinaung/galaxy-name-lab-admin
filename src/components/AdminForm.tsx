import { useState } from 'react';
import { CreateAdminRequest } from '../models/Admin';
import { adminService } from '../services/adminService';
import { Modal } from '../widgets/Modal';
import { Button } from '../widgets/Button';
import { Input } from '../widgets/Input';
import { Shield, Mail, Lock, User } from 'lucide-react';

interface AdminFormProps {
  onClose: () => void;
  onSave: () => void;
}

export function AdminForm({ onClose, onSave }: AdminFormProps) {
  const [formData, setFormData] = useState<CreateAdminRequest>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<CreateAdminRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAdminRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      console.log("formData = " + JSON.stringify(formData))
      await adminService.createAdmin(formData);
      onSave();
      handleClose();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setSubmitError('Admin with this email already exists');
      } else {
        setSubmitError('Failed to create admin. Please try again.');
      }
      console.error('Create admin error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleInputChange = (field: keyof CreateAdminRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Create New Admin"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Enter admin's full name"
            // @ts-ignore
            icon={<User className="h-5 w-5 text-gray-400" />}
            error={errors.name}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="admin@example.com"
            // @ts-ignore
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            error={errors.email}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Enter password (min. 6 characters)"
            // @ts-ignore
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            error={errors.password}
            disabled={isSubmitting}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Admin Role Information</p>
              <p className="text-blue-700">
                New admins will have full administrative access to the system including order management,
                package management, and user administration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Admin'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}