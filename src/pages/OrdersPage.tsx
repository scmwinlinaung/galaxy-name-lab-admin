import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { submissionService } from '../services/submissionService';
import { Table, Button, Card, Input, Select, Textarea, toast } from '../widgets';
import {
  Search,
  Download,
  Upload,
  Check,
  FileText,
  Calendar,
  User,
  Mail,
  DollarSign,
  Clock,
  Filter,
  File,
  MessageSquare,
  Edit,
  X,
  Eye
} from 'lucide-react';
import { Order, CreateOrderRequest, UpdateOrderRequest, GetOrdersParams } from '../models/Order';
import { Submission, UpdateSubmissionRequest } from '../models/Submission';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isSubmissionUpdateModalOpen, setIsSubmissionUpdateModalOpen] = useState(false);
  const [updatingSubmission, setUpdatingSubmission] = useState(false);
  const [responseFile, setResponseFile] = useState<File | null>(null);

  const [updateFormData, setUpdateFormData] = useState<UpdateSubmissionRequest>({
    status: undefined,
    adminComment: '',
  });

  const [formData, setFormData] = useState<CreateOrderRequest | UpdateOrderRequest>({
    user: '',
    package: '',
    businessInfo: {
      businessName: '',
      dateOfBirth: ''
    }
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: GetOrdersParams = {};

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter as Order['status'];
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await orderService.getAllOrders(Object.keys(params).length > 0 ? params : undefined);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on Enter key or with a small delay
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
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

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setConfirmingOrder(true);
      await orderService.confirmOrder(orderId);
      toast.success('Order confirmed successfully');
      fetchOrders();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    } finally {
      setConfirmingOrder(false);
    }
  };

  const handleDownloadPdf = async (orderId: string) => {
    try {
      setDownloadingPdf(true);

      // Debug: Find the order and log its details
      const order = orders.find(o => o._id === orderId);
      if (order) {
        console.log('Attempting to download PDF for order:', {
          id: order._id,
          status: order.status,
          hasPdf: !!order.pdfPath,
          pdfPath: order.pdfPath
        });
      }

      await orderService.downloadPdf(orderId);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to download PDF. Order must be confirmed and have a PDF uploaded.';
      toast.error(errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile || !selectedOrder) return;

    try {
      setUploadingPdf(true);
      await orderService.uploadPdf(selectedOrder._id, pdfFile);
      toast.success('PDF uploaded successfully');
      fetchOrders();
      setIsPdfUploadModalOpen(false);
      setPdfFile(null);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setCreatingOrder(true);
      await orderService.createOrder(formData as CreateOrderRequest);
      toast.success('Order created successfully');
      fetchOrders();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setUpdatingOrder(true);
      await orderService.updateOrder(selectedOrder._id, formData as UpdateOrderRequest);
      toast.success('Order updated successfully');
      fetchOrders();
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setUpdatingOrder(false);
    }
  };


  const resetForm = () => {
    setFormData({
      user: '',
      package: '',
      businessInfo: {
        businessName: '',
        dateOfBirth: ''
      }
    });
  };

  // Submission handlers
  const openSubmissionUpdateModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setUpdateFormData({
      status: submission.status,
      adminComment: submission.adminComment || '',
    });
    setResponseFile(null);
    setIsSubmissionUpdateModalOpen(true);
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
      await fetchSubmissions(selectedOrder?._id || '');
      setIsSubmissionUpdateModalOpen(false);
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
    setStartDate('');
    setEndDate('');
  };

  const fetchSubmissions = async (orderId: string) => {
    try {
      setLoadingSubmissions(true);
      const data = await submissionService.getSubmissionsByOrder(orderId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleRowClick = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    await fetchSubmissions(order._id);
  };


  
  const openPdfUpload = (order: Order) => {
    setSelectedOrder(order);
    setIsPdfUploadModalOpen(true);
  };

  const getUserDisplay = (user: Order['user']): string => {
    return user?.name || user?.email || 'N/A';
  };

  const getPackageDisplay = (pkg: Order['package']): string => {
    return pkg?._id || 'N/A';
  };

  const columns = [
    {
      key: 'user' as keyof Order,
      label: 'User',
      render: (_: any, order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{getUserDisplay(order.user)}</div>
          <div className="text-sm text-gray-500">{order.businessInfo.businessName}</div>
        </div>
      ),
    },
    {
      key: 'package' as keyof Order,
      label: 'Package',
      render: (value: any) => <div className="font-medium">{getPackageDisplay(value)}</div>,
    },
    {
      key: 'status' as keyof Order,
      label: 'Status',
      render: (_: any, order: Order) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof Order,
      label: 'Created Date',
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'payment' as keyof Order,
      label: 'Payment',
      render: (_: any, order: Order) => (
        <div className="text-sm">
          <div className="font-medium">{order.payment.gateway}</div>
          <div className="text-gray-500">{order.payment.status}</div>
        </div>
      ),
    },
    {
      key: 'pdfPath' as keyof Order,
      label: 'PDF',
      render: (_: any, order: Order) => (
        order.pdfPath ? (
          <span className="text-green-600 text-sm font-medium">Uploaded</span>
        ) : (
          <span className="text-gray-400 text-sm">Not uploaded</span>
        )
      ),
    },
    {
      key: 'actions' as keyof Order,
      label: 'Actions',
      render: (_: any, order: Order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(order);
          }}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
      className: 'text-center',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
   
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by Order ID, Business Name, User..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="No orders found"
          onRowClick={handleRowClick}
        />
      </Card>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
                      <button
                        onClick={() => setIsDetailModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-md hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <DetailRow icon={<User className="w-4 h-4" />} label="User" value={getUserDisplay(selectedOrder.user)} />
                      <DetailRow icon={<Mail className="w-4 h-4" />} label="Business Name" value={selectedOrder.businessInfo.businessName} />
                      <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Package" value={getPackageDisplay(selectedOrder.package)} />
                      <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={new Date(selectedOrder.businessInfo.dateOfBirth).toLocaleDateString()} />
                      <DetailRow icon={<Clock className="w-4 h-4" />} label="Created Date" value={new Date(selectedOrder.createdAt).toLocaleDateString()} />
                      <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Payment Gateway" value={selectedOrder.payment.gateway} />
                      <DetailRow icon={<Check className="w-4 h-4" />} label="Payment Status" value={selectedOrder.payment.status} />
                      <DetailRow icon={<FileText className="w-4 h-4" />} label="PDF Status" value={selectedOrder.pdfPath ? 'Uploaded' : 'Not uploaded'} />
                    </div>

                    {/* Submissions Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <File className="w-4 h-4 mr-2" />
                        Submissions ({submissions.length})
                      </h4>

                      {loadingSubmissions ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-gray-600">Loading submissions...</span>
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <File className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">No submissions found for this order</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {submissions.map((submission) => (
                            <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{submission.user?.name || 'Unknown User'}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">{submission.user?.email || ''}</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Submitted: {new Date(submission.createdAt).toLocaleString()}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openSubmissionUpdateModal(submission)}
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
                              </div>

                              {/* Admin Comment */}
                              {submission.adminComment && (
                                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                                  <div className="flex items-start">
                                    <MessageSquare className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-blue-700 mb-1">Admin Comment</div>
                                      <p className="text-sm text-blue-900">{submission.adminComment}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Files */}
                              <div className="mt-3 text-sm text-gray-500">
                                {submission.userPdfPath && (
                                  <div className="flex items-center gap-1">
                                    <File className="w-3 h-3" />
                                    <span>User PDF uploaded</span>
                                  </div>
                                )}
                                {submission.adminPdfPath && (
                                  <div className="flex items-center gap-1">
                                    <File className="w-3 h-3" />
                                    <span>Response PDF uploaded</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-end space-x-2">
                        {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'completed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmOrder(selectedOrder._id)}
                            disabled={confirmingOrder}
                            title="Confirm Order"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openPdfUpload(selectedOrder)}
                          title="Upload PDF"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadPdf(selectedOrder._id)}
                          disabled={downloadingPdf}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfUploadModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setIsPdfUploadModalOpen(false);
              setPdfFile(null);
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload PDF</h3>
                <p className="text-gray-600 mb-4">Upload the PDF file for order {selectedOrder._id}</p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                {pdfFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {pdfFile.name}</p>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleUploadPdf}
                  disabled={!pdfFile || uploadingPdf}
                  loading={uploadingPdf}
                >
                  Upload
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsPdfUploadModalOpen(false);
                    setPdfFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Order</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <Input
                      value={(formData as CreateOrderRequest).user}
                      onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                      placeholder="Enter user identifier"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                    <Input
                      value={(formData as CreateOrderRequest).package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      placeholder="Enter package name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <Input
                      value={(formData as CreateOrderRequest).businessInfo.businessName}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessInfo: { ...(formData as CreateOrderRequest).businessInfo, businessName: e.target.value }
                      })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <Input
                      type="date"
                      value={(formData as CreateOrderRequest).businessInfo.dateOfBirth}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessInfo: { ...(formData as CreateOrderRequest).businessInfo, dateOfBirth: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleCreateOrder}
                  disabled={creatingOrder || !(formData as CreateOrderRequest).user || !(formData as CreateOrderRequest).package}
                  loading={creatingOrder}
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Order</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <Input
                      value={(formData as any).user || ''}
                      onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                    <Input
                      value={(formData as any).package || ''}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                      value={(formData as UpdateOrderRequest).status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Order['status'] })}
                    >
                      <option value="">Select status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleUpdateOrder}
                  disabled={updatingOrder}
                  loading={updatingOrder}
                >
                  Update
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Submission Modal */}
      {isSubmissionUpdateModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setIsSubmissionUpdateModalOpen(false);
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
                        {selectedSubmission.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-gray-500">{selectedSubmission.user?.email || ''}</div>
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
                    setIsSubmissionUpdateModalOpen(false);
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

// Helper component for detail rows
const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2">
    <div className="text-gray-500">{icon}</div>
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default OrdersPage;
