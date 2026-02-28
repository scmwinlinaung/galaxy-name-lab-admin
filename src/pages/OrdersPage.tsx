import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { submissionService } from '../services/submissionService';
import { Table, Button, Card, Input, Select, Textarea, toast } from '../widgets';
import {
  Search,
  Check,
  FileText,
  Calendar,
  User,
  Mail,
  DollarSign,
  Clock,
  Filter,
  MessageSquare,
  X,
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
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
      fullName: '',
      dob: '',
      birthTime: '',
      birthPlace: '',
      details: '',
      preferredSyllables: []
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
      console.log("orderId = " + orderId)
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
        fullName: '',
        dob: '',
        birthTime: '',
        birthPlace: '',
        details: '',
        preferredSyllables: []
      }
    });
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


  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };



  const handleRowClick = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };




  const getUserDisplay = (user: Order['user']): string => {
    return user?.name || user?.email || 'N/A';
  };

  const getPackageDisplay = (pkg: Order['package']): string => {
    if (!pkg) return 'N/A';
    // Display category name and plan name if available
    const parts = [];
    if (pkg.categoryName) parts.push(pkg.categoryName);
    if (pkg.plan?.name) parts.push(pkg.plan.name);
    return parts.length > 0 ? parts.join(' - ') : 'N/A';
  };

  const columns = [
    {
      key: 'user' as keyof Order,
      label: 'User',
      render: (_: any, order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{getUserDisplay(order.user)}</div>
          <div className="text-sm text-gray-500">{order.businessInfo.fullName}</div>
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
      key: 'price' as keyof Order,
      label: 'Price',
      render: (_: any, order: Order) => {
        const amount = order.price?.amount || order.package?.price?.amount;
        const currency = order.price?.currency || order.package?.price?.currency;
        return amount && currency ? (
          <div className="font-medium">
            {amount.toLocaleString()} {currency}
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      },
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
          className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors font-medium"
        >
          View Details
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
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Order Details</h3>
                    <p className="text-indigo-100 text-sm mt-1">Order ID: {selectedOrder._id}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-white hover:text-indigo-200 transition-colors p-2 rounded-full hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Information Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">User Information</h4>
                    </div>
                    <div className="space-y-3">
                      <DetailRow icon={<Mail className="w-4 h-4 text-blue-600" />} label="User" value={getUserDisplay(selectedOrder.user)} />
                      <DetailRow icon={<User className="w-4 h-4 text-blue-600" />} label="Full Name" value={selectedOrder.businessInfo.fullName} />
                    </div>
                  </div>

                  {/* Package & Order Section */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Package & Order</h4>
                    </div>
                    <div className="space-y-3">
                      <DetailRow icon={<FileText className="w-4 h-4 text-purple-600" />} label="Package" value={getPackageDisplay(selectedOrder.package)} />
                      <DetailRow icon={<Clock className="w-4 h-4 text-purple-600" />} label="Created Date" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                    </div>
                  </div>

                  {/* Birth Information Section */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-200">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Birth Information</h4>
                    </div>
                    <div className="space-y-3">
                      <DetailRow icon={<Calendar className="w-4 h-4 text-amber-600" />} label="Date of Birth" value={new Date(selectedOrder.businessInfo.dob).toLocaleDateString()} />
                      <DetailRow icon={<Clock className="w-4 h-4 text-amber-600" />} label="Birth Time" value={selectedOrder.businessInfo.birthTime} />
                      <DetailRow icon={<User className="w-4 h-4 text-amber-600" />} label="Birth Place" value={selectedOrder.businessInfo.birthPlace} />
                    </div>
                  </div>

                  {/* Payment Information Section */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-200">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Payment Information</h4>
                    </div>
                    <div className="space-y-3">
                      <DetailRow icon={<DollarSign className="w-4 h-4 text-emerald-600" />} label="Gateway" value={selectedOrder.payment.gateway} />
                      <DetailRow icon={<DollarSign className="w-4 h-4 text-emerald-600" />} label="Amount" value={selectedOrder.price?.amount ? `${selectedOrder.price.amount.toLocaleString()} ${selectedOrder.price.currency}` : selectedOrder.package?.price?.amount ? `${selectedOrder.package.price.amount.toLocaleString()} ${selectedOrder.package.price.currency}` : 'N/A'} />
                      <DetailRow icon={<Check className="w-4 h-4 text-emerald-600" />} label="Status" value={selectedOrder.payment.status} />
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="md:col-span-2 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-5 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-200">
                      <div className="p-2 bg-cyan-500 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Additional Details</h4>
                    </div>
                    <div className="space-y-3">
                      <DetailRow icon={<FileText className="w-4 h-4 text-cyan-600" />} label="Details" value={selectedOrder.businessInfo.details} />
                      <DetailRow icon={<Check className="w-4 h-4 text-cyan-600" />} label="Preferred Syllables" value={selectedOrder.businessInfo.preferredSyllables.join(', ')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'completed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirmOrder(selectedOrder._id)}
                      disabled={confirmingOrder}
                      title="Confirm Order"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Order
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDetailModalOpen(false)}
                    disabled={confirmingOrder}
                    title="Close"
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* PDF Upload Modal */}
      {
        isPdfUploadModalOpen && selectedOrder && (
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
        )
      }

      {/* Create Order Modal */}
      {
        isCreateModalOpen && (
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <Input
                        value={(formData as CreateOrderRequest).businessInfo.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: { ...(formData as CreateOrderRequest).businessInfo, fullName: e.target.value }
                        })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <Input
                        type="date"
                        value={(formData as CreateOrderRequest).businessInfo.dob}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: { ...(formData as CreateOrderRequest).businessInfo, dob: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time</label>
                      <Input
                        type="time"
                        value={(formData as CreateOrderRequest).businessInfo.birthTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: { ...(formData as CreateOrderRequest).businessInfo, birthTime: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                      <Input
                        value={(formData as CreateOrderRequest).businessInfo.birthPlace}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: { ...(formData as CreateOrderRequest).businessInfo, birthPlace: e.target.value }
                        })}
                        placeholder="Enter birth place"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                      <Textarea
                        value={(formData as CreateOrderRequest).businessInfo.details}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: { ...(formData as CreateOrderRequest).businessInfo, details: e.target.value }
                        })}
                        placeholder="Enter additional details"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Syllables</label>
                      <Input
                        type="text"
                        value={(formData as CreateOrderRequest).businessInfo.preferredSyllables.join(', ')}
                        onChange={(e) => setFormData({
                          ...formData,
                          businessInfo: {
                            ...(formData as CreateOrderRequest).businessInfo,
                            preferredSyllables: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                          }
                        })}
                        placeholder="Enter syllables separated by comma (e.g., 2, 3, 4)"
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
        )
      }

      {/* Edit Order Modal */}
      {
        isEditModalOpen && selectedOrder && (
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
        )
      }

      {/* Update Submission Modal */}
      {
        isSubmissionUpdateModalOpen && selectedSubmission && (
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
        )
      }
    </div >
  );
};

// Helper component for detail rows
const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
    </div>
  </div>
);

export default OrdersPage;
