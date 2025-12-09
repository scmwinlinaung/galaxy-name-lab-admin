import { useState, useEffect } from 'react';
import { Package, packageService } from '../services/packageService';
import { Edit, Trash2, Plus, Search, Filter, ChevronDown, Package as LucidePackage, Star, Clock, FileText } from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PackageListProps {
  onEdit: (packageItem: Package) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function PackageList({ onEdit, onDelete, onAdd }: PackageListProps) {
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
      console.log("package id = " + deleteDialog.packageId);
      await packageService.deletePackage(deleteDialog.packageId);
      setPackages(packages.filter(pkg => (pkg.id || pkg._id) !== deleteDialog.packageId));
      onDelete(deleteDialog.packageId);
      setDeleteDialog({ isOpen: false, packageId: null, packageName: '' });
      setError('');
    } catch (err) {
      setError('Failed to delete package. Please try again.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Packages</h2>
          <p className="text-gray-600 mt-1">Manage your subscription packages</p>
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
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Packages List */}
      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <LucidePackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
              <p className="mt-1 text-sm text-gray-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  {/* Package Header */}
                  <div className="relative">
                    {pkg.image ? (
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Package+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <LucidePackage className="h-16 w-16 text-purple-600" />
                      </div>
                    )}
                    {pkg.isPopular && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </div>
                    )}
                  </div>

                  {/* Package Content */}
                  <div className="p-4 space-y-4">
                    {/* Title and Price */}
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{pkg.name}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">${pkg.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {pkg.category}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3">{pkg.description}</p>

                    {/* Package Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {pkg.submissionDurationDays} days delivery
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-2" />
                        {pkg.submissionLimit} revisions
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(pkg)}
                          className="inline-flex items-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const packageId = pkg.id || pkg._id;
                            if (packageId) {
                              handleDelete(packageId);
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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