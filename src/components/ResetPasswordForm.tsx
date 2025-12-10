import { useState } from 'react';
import { Admin } from '../models/Admin';
import { adminService } from '../services/adminService';
import { Modal } from '../widgets/Modal';
import { Button } from '../widgets/Button';
import { Input } from '../widgets/Input';
import { Shield, Lock, Key, User, Mail } from 'lucide-react';

interface ResetPasswordFormProps {
  admin: Admin;
  onClose: () => void;
  onSave: () => void;
}

export function ResetPasswordForm({ admin, onClose, onSave }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      await adminService.resetPassword(admin.id, password);
      onSave();
      handleClose();
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSubmitError('Admin not found');
      } else {
        setSubmitError('Failed to reset password. Please try again.');
      }
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Reset Admin Password"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Admin Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Shield className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">Admin Information</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span>{admin.name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span>{admin.email}</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter new password (min. 6 characters)"
            // @ts-ignore
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            error={errors.password}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="Confirm the new password"
            // @ts-ignore
            icon={<Key className="h-5 w-5 text-gray-400" />}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Key className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Password Reset Warning</p>
              <p className="text-yellow-700">
                This will immediately update the admin's password. The admin will need to use the new password
                for their next login. Please ensure the admin is notified of this change.
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
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Resetting...
              </div>
            ) : (
              'Reset Password'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}