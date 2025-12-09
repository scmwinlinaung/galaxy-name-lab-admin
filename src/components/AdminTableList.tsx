import { useState, useEffect } from 'react';
import { Admin } from '../models/Admin';
import { adminService } from '../services/adminService';
import { Table, TableColumn } from '../widgets/Table';
import { Edit, Plus, Search, Shield, Mail, Calendar, Key } from 'lucide-react';

interface AdminTableListProps {
  onEdit: (admin: Admin) => void;
  onResetPassword: (admin: Admin) => void;
  onAdd: () => void;
}

export function AdminTableList({ onEdit, onResetPassword, onAdd }: AdminTableListProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAdmins();
      setAdmins(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch admins. Please try again.');
      console.error('Fetch admins error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: TableColumn<Admin>[] = [
    {
      key: 'name',
      label: 'Admin Name',
      width: '200px',
      render: (_, admin) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mr-3">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{admin.name}</div>
            <div className="text-sm text-gray-500 capitalize">{admin.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      width: '250px',
      render: (value) => (
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          {value}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      width: '120px',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: '150px',
      render: (value) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions' as keyof Admin,
      label: 'Actions',
      width: '200px',
      render: (_, admin) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onResetPassword(admin)}
            className="inline-flex items-center justify-center sm:justify-start px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Reset Password
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Admin Users</h2>
            <p className="text-gray-600 mt-1">View and manage all admin users in the system</p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Admin
          </button>
        </div>

        {/* Search */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admins by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Table Container */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading admins...</span>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <Shield className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">No admins found</h3>
              <p className="mt-2 text-sm text-gray-500 px-4">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Get started by creating a new admin user'
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={onAdd}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Admin
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <Table
                data={filteredAdmins}
                columns={columns}
                loading={loading}
                emptyMessage="No admins found"
                striped={true}
                hover={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}