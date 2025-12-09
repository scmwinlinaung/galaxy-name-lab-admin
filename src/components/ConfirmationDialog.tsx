import { AlertTriangle, Trash2, Save, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'delete' | 'update' | 'default';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'default',
  confirmText,
  cancelText = 'Cancel',
  isLoading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'delete':
        return {
          icon: Trash2,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-white'
        };
      case 'update':
        return {
          icon: Save,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'text-white'
        };
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-gray-600 hover:bg-gray-700',
          buttonText: 'text-white'
        };
    }
  };

  const { icon: Icon, iconBg, iconColor, buttonBg, buttonText } = getIconAndColors();
  const defaultConfirmText = type === 'delete' ? 'Delete' : type === 'update' ? 'Update' : 'Confirm';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header with icon */}
          <div className="flex flex-col items-center p-6 pb-0">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${iconBg} mb-4`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="p-6 pt-4">
            <p className="text-gray-600 text-center leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              type="button"
              className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium shadow-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelText}
            </button>
            <button
              type="button"
              className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg ${buttonBg} ${buttonText} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm ${
                type === 'delete' ? 'focus:ring-red-500' : type === 'update' ? 'focus:ring-blue-500' : 'focus:ring-gray-500'
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  {confirmText || defaultConfirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}