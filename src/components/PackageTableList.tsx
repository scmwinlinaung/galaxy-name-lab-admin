import { useState, useEffect } from 'react';
import { Package } from '../models/Package';
import { packageService } from '../services/packageService';
import { Table, TableColumn } from '../widgets/Table';
import { Edit, Trash2, Plus, Search, Filter, ChevronDown, Package as LucidePackage, Star, Clock, FileText } from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PackageTableListProps {
  onEdit: (packageItem: Package) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function PackageTableList({ onEdit, onDelete, onAdd }: PackageTableListProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'popular' | 'regular'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    packageId: string | null;
    packageName: string;
  }>({
    isOpen: false,
    packageId: null,
    packageName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAllPackages();
      setPackages(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch packages. Please try again.');
      console.error('Fetch packages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const packageToDelete = packages.find(pkg => pkg.id === id || pkg._id === id);
    setDeleteDialog({
      isOpen: true,
      packageId: id,
      packageName: packageToDelete?.name || 'this package'
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.packageId) return;

    try {
      setIsDeleting(true);
      await packageService.deletePackage(deleteDialog.packageId);
      // Filter out the deleted package by both id and _id fields
      setPackages(prevPackages => prevPackages.filter(pkg => {
        const packageId = pkg.id || pkg._id;
        return packageId !== deleteDialog.packageId;
      }));
      onDelete(deleteDialog.packageId);
      setError(''); // Clear any previous errors
      setDeleteDialog({ isOpen: false, packageId: null, packageName: '' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete package. Please try again.';
      setError(errorMessage);
      console.error('Delete package error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, packageId: null, packageName: '' });
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'popular' && pkg.isPopular) ||
      (filterStatus === 'regular' && !pkg.isPopular);

    return matchesSearch && matchesFilter;
  });

  const columns: TableColumn<Package>[] = [
    {
      key: 'image' as keyof Package,
      label: 'Image',
      width: '120px',
      render: (_, pkg) => (
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center border border-gray-200">
              <LucidePackage className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Package Name',
      width: '200px',
      render: (_, pkg) => (
        <div className="flex flex-col min-w-0">
          <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">{pkg.name}</div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              {pkg.category}
            </span>
            {pkg.isPopular && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Popular</span>
                <span className="sm:hidden">★</span>
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '250px',
      render: (value) => (
        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
          {value}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      width: '100px',
      render: (value) => (
        <div className="font-semibold text-gray-900 text-sm sm:text-base">
          ${value.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'submissionDurationDays',
      label: 'Delivery Time',
      width: '120px',
      render: (value) => (
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">{value} days</span>
          <span className="sm:hidden">{value}d</span>
        </div>
      ),
    },
    {
      key: 'submissionLimit',
      label: 'Revisions',
      width: '120px',
      render: (value) => (
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">{value} revisions</span>
          <span className="sm:hidden">{value} rev</span>
        </div>
      ),
    },
    {
      key: 'actions' as keyof Package,
      label: 'Actions',
      width: '200px',
      render: (_, pkg) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onEdit(pkg)}
            className="inline-flex items-center justify-center sm:justify-start px-2 sm:px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => {
              const packageId = pkg.id || pkg._id;
              if (packageId) {
                handleDelete(packageId);
              } else {
                setError('Package ID not found. Unable to delete.');
                console.error('Package ID not found:', pkg);
              }
            }}
            className="inline-flex items-center justify-center sm:justify-start px-2 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Delete
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
            <h2 className="text-2xl font-bold text-gray-900">Manage your subscription packages</h2>
            <p className="text-gray-600 mt-1">View and manage all your service packages in one place</p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Package
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <div className="flex space-x-2">
                  {(['all', 'popular', 'regular'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === status
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {status === 'all' ? 'All Packages' : status === 'popular' ? 'Popular' : 'Regular'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
              <span className="ml-2 text-gray-600">Loading packages...</span>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <LucidePackage className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">No packages found</h3>
              <p className="mt-2 text-sm text-gray-500 px-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new package'}
              </p>
              <div className="mt-6">
                <button
                  onClick={onAdd}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Package
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <Table
                data={filteredPackages}
                columns={columns}
                loading={loading}
                emptyMessage="No packages found"
                striped={true}
                hover={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteDialog.packageName}"? This action cannot be undone and all associated data will be permanently removed.`}
        type="delete"
        confirmText="Delete Package"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}