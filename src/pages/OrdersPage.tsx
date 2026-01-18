import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { Table, Button, Card, Input, Select, toast } from '../widgets';
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
  Filter
} from 'lucide-react';
import { Order, CreateOrderRequest, UpdateOrderRequest, GetOrdersParams } from '../models/Order';

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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
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
        <div className="flex space-x-2">
          {order.status !== 'confirmed' && order.status !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConfirmOrder(order._id)}
              disabled={confirmingOrder}
              title="Confirm Order"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openPdfUpload(order)}
            title="Upload PDF"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadPdf(order._id)}
            disabled={downloadingPdf}
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <Button variant="primary" onClick={openCreateModal}>
          Create Order
        </Button>
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
        />
      </Card>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Order Details</h3>

                    <div className="space-y-3">
                      <DetailRow icon={<User className="w-4 h-4" />} label="User" value={getUserDisplay(selectedOrder.user)} />
                      <DetailRow icon={<Mail className="w-4 h-4" />} label="Business Name" value={selectedOrder.businessInfo.businessName} />
                      <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Package" value={getPackageDisplay(selectedOrder.package)} />
                      <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={new Date(selectedOrder.businessInfo.dateOfBirth).toLocaleDateString()} />
                      <DetailRow icon={<Clock className="w-4 h-4" />} label="Created Date" value={new Date(selectedOrder.createdAt).toLocaleDateString()} />
                      <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Payment Gateway" value={selectedOrder.payment.gateway} />
                      <DetailRow icon={<Check className="w-4 h-4" />} label="Payment Status" value={selectedOrder.payment.status} />
                      <DetailRow icon={<FileText className="w-4 h-4" />} label="PDF Status" value={selectedOrder.pdfPath ? 'Uploaded' : 'Not uploaded'} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'completed' && (
                  <Button
                    variant="primary"
                    onClick={() => handleConfirmOrder(selectedOrder._id)}
                    disabled={confirmingOrder}
                    loading={confirmingOrder}
                  >
                    Confirm Order
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => openPdfUpload(selectedOrder)}
                  className="sm:mr-3"
                >
                  Upload PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownloadPdf(selectedOrder._id)}
                  disabled={downloadingPdf}
                  loading={downloadingPdf}
                  className="sm:mr-3"
                >
                  Download PDF
                </Button>
                <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
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
