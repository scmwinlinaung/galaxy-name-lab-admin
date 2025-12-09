import React, { useState, useEffect } from 'react';
import { adminUserService, AdminUser, CreateAdminUserRequest } from '../services/orderService';
import {
  Table,
  Button,
  Modal,
  Card,
  Input,
  toast
} from '../widgets';
import {
  Users,
  Plus,
  Key,
  Calendar,
  Shield,
  User
} from 'lucide-react';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Form state for creating user
  const [createUserForm, setCreateUserForm] = useState<CreateAdminUserRequest>({
    name: '',
    email: '',
    password: '',
  });

  // Form state for resetting password
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Since there's no GET endpoint for users in the provided APIs,
      // we'll show a message or you might need to add this endpoint
      // For now, we'll use mock data to demonstrate the UI
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@galaxynamelab.com',
          createdAt: '2024-01-15T10:00:00Z',
          role: 'admin',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setCreatingUser(true);
      const newUser = await adminUserService.createAdminUser(createUserForm);
      toast.success('Admin user created successfully');
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      setCreateUserForm({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!selectedUser || !resetPasswordForm.newPassword) {
      toast.error('Please provide a new password');
      return;
    }

    try {
      setResettingPassword(true);
      await adminUserService.resetPassword(selectedUser.id, resetPasswordForm.newPassword);
      toast.success('Password reset successfully');
      setIsResetPasswordModalOpen(false);
      setResetPasswordForm({ newPassword: '', confirmPassword: '' });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const openResetPasswordModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const columns = [
    {
      key: 'name' as keyof AdminUser,
      label: 'User',
      render: (_: any, user: AdminUser) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role' as keyof AdminUser,
      label: 'Role',
      render: (_: any, user: AdminUser) => (
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-purple-500" />
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt' as keyof AdminUser,
      label: 'Created',
      render: (value: any) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: 'id' as keyof AdminUser,
      label: 'Actions',
      render: (_: any, user: AdminUser) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openResetPasswordModal(user)}
          >
            <Key className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Admin User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateUserForm({ name: '', email: '', password: '' });
        }}
        title="Create Admin User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              value={createUserForm.name}
              onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
              placeholder="Enter user name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={createUserForm.email}
              onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={createUserForm.password}
              onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateUserForm({ name: '', email: '', password: '' });
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={creatingUser}
              loading={creatingUser}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setResetPasswordForm({ newPassword: '', confirmPassword: '' });
          setSelectedUser(null);
        }}
        title="Reset Password"
        size="md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Reset password for: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={resetPasswordForm.newPassword}
              onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={resetPasswordForm.confirmPassword}
              onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsResetPasswordModalOpen(false);
                setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={resettingPassword}
              loading={resettingPassword}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;