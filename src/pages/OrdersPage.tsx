import React, { useState, useEffect } from 'react';
import {
  orderService,
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
} from '../services/orderService';
import {
  Table,
  Button,
  Modal,
  Card,
  Input,
  Select,
  toast
} from '../widgets';
import {
  Search,
  Download,
  Check,
  FileText,
  Calendar,
  User,
  Mail,
  DollarSign,
  Clock,
  Edit3
} from 'lucide-react';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Form states for create/edit
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
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.businessInfo.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleUploadPdf = async () => {
    if (!pdfFile || !selectedOrder) return;

    try {
      setUploadingPdf(true);
      await orderService.uploadPdf(selectedOrder.id, pdfFile);
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
      await orderService.updateOrder(selectedOrder.id, formData as UpdateOrderRequest);
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderService.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
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

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      user: order.user,
      package: order.package,
      businessInfo: order.businessInfo
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openPdfUpload = (order: Order) => {
    setSelectedOrder(order);
    setIsPdfUploadModalOpen(true);
  };

  const columns = [
    {
      key: 'user' as keyof Order,
      label: 'User',
      render: (value: any, order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{order.businessInfo.businessName}</div>
        </div>
      ),
    },
    {
      key: 'package' as keyof Order,
      label: 'Package',
      render: (value: any) => (
        <div className="font-medium">{value}</div>
      ),
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
      key: 'id' as keyof Order,
      label: 'Actions',
      render: (_: any, order: Order) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openOrderDetail(order)}
          >
            <FileText className="w-4 h-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(order)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          {order.status !== 'confirmed' && order.status !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConfirmOrder(order.id)}
              disabled={confirmingOrder}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openPdfUpload(order)}
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteOrder(order.id)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <Button
          variant="primary"
          onClick={openCreateModal}
        >
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          data={filteredOrders}
          columns={columns}
          loading={loading}
          emptyMessage="No orders found"
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">User:</span>
                  <span>{selectedOrder.user}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Business Name:</span>
                  <span>{selectedOrder.businessInfo.businessName}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Package:</span>
                  <span>{selectedOrder.package}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>{new Date(selectedOrder.businessInfo.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Created Date:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Payment Gateway:</span>
                  <span>{selectedOrder.payment.gateway}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Payment Status:</span>
                  <span>{selectedOrder.payment.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => handleConfirmOrder(selectedOrder.id)}
                  disabled={confirmingOrder}
                  loading={confirmingOrder}
                >
                  Confirm Order
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => openPdfUpload(selectedOrder)}
              >
                Upload PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* PDF Upload Modal */}
      <Modal
        isOpen={isPdfUploadModalOpen}
        onClose={() => {
          setIsPdfUploadModalOpen(false);
          setPdfFile(null);
        }}
        title="Upload PDF"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload the PDF file for order {selectedOrder?.id}
          </p>

          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />

          {pdfFile && (
            <div className="text-sm text-gray-600">
              Selected file: {pdfFile.name}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsPdfUploadModalOpen(false);
                setPdfFile(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleUploadPdf}
              disabled={!pdfFile || uploadingPdf}
              loading={uploadingPdf}
            >
              Upload PDF
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Order"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <Input
              value={(formData as CreateOrderRequest).user}
              onChange={(e) => setFormData({
                ...formData,
                user: e.target.value
              })}
              placeholder="Enter user identifier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package
            </label>
            <Input
              value={(formData as CreateOrderRequest).package}
              onChange={(e) => setFormData({
                ...formData,
                package: e.target.value
              })}
              placeholder="Enter package name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <Input
              value={(formData as CreateOrderRequest).businessInfo.businessName}
              onChange={(e) => setFormData({
                ...formData,
                // @ts-ignore
                businessInfo: {
                  ...formData.businessInfo,
                  businessName: e.target.value
                }
              })}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              value={(formData as CreateOrderRequest).businessInfo.dateOfBirth}
              onChange={(e) => setFormData({
                ...formData,
                // @ts-ignore
                businessInfo: {
                  ...formData.businessInfo,
                  dateOfBirth: e.target.value
                }
              })}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleCreateOrder}
              disabled={creatingOrder || !(formData as CreateOrderRequest).user || !(formData as CreateOrderRequest).package}
              loading={creatingOrder}
            >
              Create Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Order"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <Input
              value={(formData as UpdateOrderRequest).user || ''}
              onChange={(e) => setFormData({
                ...formData,
                user: e.target.value
              })}
              placeholder="Enter user identifier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package
            </label>
            <Input
              value={(formData as UpdateOrderRequest).package || ''}
              onChange={(e) => setFormData({
                ...formData,
                package: e.target.value
              })}
              placeholder="Enter package name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <Input
              value={(formData as UpdateOrderRequest).businessInfo?.businessName || ''}
              onChange={(e) => setFormData({
                ...formData,
                // @ts-ignore
                businessInfo: {
                  ...formData.businessInfo,
                  businessName: e.target.value
                }
              })}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              value={(formData as UpdateOrderRequest).businessInfo?.dateOfBirth || ''}
              onChange={(e) => setFormData({
                ...formData,
                // @ts-ignore
                businessInfo: {
                  ...formData.businessInfo,
                  dateOfBirth: e.target.value
                }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={(formData as UpdateOrderRequest).status || ''}
              onChange={(e) => setFormData({
                ...formData,
                status: e.target.value as Order['status']
              })}
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleUpdateOrder}
              disabled={updatingOrder}
              loading={updatingOrder}
            >
              Update Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;