import React, { useState, useEffect } from 'react';
import { submissionService } from '../services/submissionService';
import { Table, Button, Card, Input, Select, Textarea, toast } from '../widgets';
import {
  Search,
  Download,
  Edit,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Submission, UpdateSubmissionRequest } from '../models/Submission';

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingSubmission, setUpdatingSubmission] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [responseFile, setResponseFile] = useState<File | null>(null);

  const [updateFormData, setUpdateFormData] = useState<UpdateSubmissionRequest>({
    status: undefined,
    adminComment: '',
  });

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getAllSubmissions();

      // Filter by status if not 'all'
      let filteredData = data;
      if (statusFilter !== 'all') {
        filteredData = data.filter(s => s.status === statusFilter);
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(s =>
          s.user?.name?.toLowerCase().includes(term) ||
          s.user?.email?.toLowerCase().includes(term) ||
          s._id?.toLowerCase().includes(term) ||
          s.order?._id?.toLowerCase().includes(term)
        );
      }

      setSubmissions(filteredData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchSubmissions();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const openUpdateModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setUpdateFormData({
      status: submission.status,
      adminComment: submission.adminComment || '',
    });
    setResponseFile(null);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setUpdatingSubmission(true);
      await submissionService.updateSubmission(
        selectedSubmission._id,
        {
          ...updateFormData,
          file: responseFile || undefined,
        }
      );
      toast.success('Submission updated successfully');
      fetchSubmissions();
      setIsUpdateModalOpen(false);
      setSelectedSubmission(null);
      setResponseFile(null);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    } finally {
      setUpdatingSubmission(false);
    }
  };

  const handleDownloadAdminPdf = async (submissionId: string) => {
    try {
      setDownloadingPdf(true);
      await submissionService.downloadAdminPdf(submissionId);
      toast.success('Admin PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to download PDF';
      toast.error(errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadUserPdf = async (submissionId: string) => {
    try {
      setDownloadingPdf(true);
      await submissionService.downloadUserPdf(submissionId);
      toast.success('User PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to download PDF';
      toast.error(errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getUserDisplay = (user: Submission['user']): string => {
    return user?.name || user?.email || 'N/A';
  };

  const columns = [
    {
      key: 'user' as keyof Submission,
      label: 'User',
      render: (_: any, submission: Submission) => (
        <div>
          <div className="font-medium text-gray-900">{getUserDisplay(submission.user)}</div>
          <div className="text-sm text-gray-500">{submission.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'order' as keyof Submission,
      label: 'Order ID',
      render: (_: any, submission: Submission) => (
        <div className="font-mono text-sm">{submission.order?._id || 'N/A'}</div>
      ),
    },
    {
      key: 'status' as keyof Submission,
      label: 'Status',
      render: (_: any, submission: Submission) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
          {getStatusIcon(submission.status)}
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'adminComment' as keyof Submission,
      label: 'Admin Comment',
      render: (value: any) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value || 'No comment'}>
          {value || 'No comment'}
        </div>
      ),
    },
    {
      key: 'createdAt' as keyof Submission,
      label: 'Submitted',
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'files' as keyof Submission,
      label: 'Files',
      render: (_: any, submission: Submission) => (
        <div className="text-sm space-y-1">
          <div className={submission.userPdfPath ? 'text-green-600' : 'text-gray-400'}>
            User PDF: {submission.userPdfPath ? 'Yes' : 'No'}
          </div>
          <div className={submission.adminPdfPath ? 'text-green-600' : 'text-gray-400'}>
            Admin PDF: {submission.adminPdfPath ? 'Yes' : 'No'}
          </div>
        </div>
      ),
    },
    {
      key: 'actions' as keyof Submission,
      label: 'Actions',
      render: (_: any, submission: Submission) => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openUpdateModal(submission)}
            title="Update Submission"
          >
            <Edit className="w-4 h-4" />
          </Button>

          {submission.adminPdfPath && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownloadAdminPdf(submission._id)}
              disabled={downloadingPdf}
              title="Download Admin Response"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          {submission.userPdfPath && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownloadUserPdf(submission._id)}
              disabled={downloadingPdf}
              title="Download User Submission"
            >
              <FileText className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Submissions Management</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by User, Email, Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Reviewed</option>
                {/* <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option> */}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card>
        <Table
          data={submissions}
          columns={columns}
          loading={loading}
          emptyMessage="No submissions found"
        />
      </Card>

      {/* Update Submission Modal */}
      {isUpdateModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setIsUpdateModalOpen(false);
              setSelectedSubmission(null);
              setResponseFile(null);
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Submission</h3>

                <div className="space-y-4">
                  {/* User Info Display */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {getUserDisplay(selectedSubmission.user)}
                      </div>
                      <div className="text-gray-500">{selectedSubmission.user?.email}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        Order ID: {selectedSubmission.order?._id}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                      value={updateFormData.status || ''}
                      onChange={(e) => setUpdateFormData({
                        ...updateFormData,
                        status: e.target.value as Submission['status']
                      })}
                    >
                      <option value="reviewed">Reviewed</option>
                    </Select>
                  </div>

                  {/* Admin Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Comment</label>
                    <Textarea
                      placeholder="Add a comment for the user..."
                      value={updateFormData.adminComment || ''}
                      onChange={(e) => setUpdateFormData({
                        ...updateFormData,
                        adminComment: e.target.value
                      })}
                      rows={3}
                    />
                  </div>

                  {/* Response File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response PDF 
                    </label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResponseFile(e.target.files?.[0] || null)}
                    />
                    {responseFile && (
                      <p className="mt-2 text-sm text-gray-600">Selected: {responseFile.name}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a response PDF for the user (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleUpdateSubmission}
                  disabled={updatingSubmission}
                  loading={updatingSubmission}
                >
                  Update Submission
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedSubmission(null);
                    setResponseFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
