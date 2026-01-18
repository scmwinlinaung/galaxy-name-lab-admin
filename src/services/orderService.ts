import { API_ENDPOINTS } from '../constants/api';
import api from '../api';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  GetOrdersParams,
} from '../models/Order';

// Order management functions
export const orderService = {
  // Get all orders with optional search and filtering
  getAllOrders: async (params?: GetOrdersParams): Promise<Order[]> => {
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ADMIN.ORDERS.GET_ALL}?${queryParams.toString()}`
      : API_ENDPOINTS.ADMIN.ORDERS.GET_ALL;

    const response = await api.get(url);
    console.log("response = " + JSON.stringify(response.data))
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.ORDERS.CREATE, orderData);
    return response.data;
  },

  // Update existing order
  updateOrder: async (orderId: string, orderData: UpdateOrderRequest): Promise<Order> => {
    const response = await api.put(API_ENDPOINTS.ADMIN.ORDERS.UPDATE(orderId), orderData);
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN.ORDERS.DELETE(orderId));
  },

  // Upload PDF for an order
  uploadPdf: async (orderId: string, pdfFile: File): Promise<Order> => {
    const formData = new FormData();
    formData.append('orderPdf', pdfFile);

    const response = await api.post(
      API_ENDPOINTS.ADMIN.ORDERS.UPLOAD_PDF(orderId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Confirm an order
  confirmOrder: async (orderId: string): Promise<Order> => {
    const response = await api.put(API_ENDPOINTS.ADMIN.ORDERS.CONFIRM(orderId));
    return response.data;
  },

  // Download PDF for an order
  downloadPdf: async (orderId: string): Promise<void> => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ORDERS.DOWNLOAD_PDF(orderId), {
        responseType: 'blob',
      });
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a temporary anchor element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}.pdf`;

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      // Handle blob error responses
      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        console.error('Download error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorJson.error || errorText);
        } catch {
          throw new Error(errorText);
        }
      }
      throw error;
    }
  },
};
