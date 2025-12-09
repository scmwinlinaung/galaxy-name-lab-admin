import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

// Types for Order management
export interface BusinessInfo {
  businessName: string;
  dateOfBirth: string;
}

export interface PaymentInfo {
  paymentId: string;
  gateway: string;
  status: string;
}

export interface Order {
  id: string;
  user: string;
  package: string;
  businessInfo: BusinessInfo;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment: PaymentInfo;
  pdfPath?: string;
  createdAt: string;
}

export interface CreateOrderRequest {
  user: string;
  package: string;
  businessInfo: BusinessInfo;
}

export interface UpdateOrderRequest {
  user?: string;
  package?: string;
  businessInfo?: BusinessInfo;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
}

// Order management functions
export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    const response = await axios.get(API_ENDPOINTS.ADMIN.ORDERS.GET_ALL);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await axios.post(API_ENDPOINTS.ADMIN.ORDERS.CREATE, orderData);
    return response.data;
  },

  // Update existing order
  updateOrder: async (orderId: string, orderData: UpdateOrderRequest): Promise<Order> => {
    const response = await axios.put(API_ENDPOINTS.ADMIN.ORDERS.UPDATE(orderId), orderData);
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.ADMIN.ORDERS.DELETE(orderId));
  },

  // Upload PDF for an order
  uploadPdf: async (orderId: string, pdfFile: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('orderPdf', pdfFile);

    const response = await axios.post(
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
    const response = await axios.put(API_ENDPOINTS.ADMIN.ORDERS.CONFIRM(orderId));
    return response.data;
  },
};

// Admin user management functions
export const adminUserService = {
  // Create new admin user
  createAdminUser: async (userData: CreateAdminUserRequest): Promise<AdminUser> => {
    const response = await axios.post(API_ENDPOINTS.ADMIN.USERS.CREATE, userData);
    return response.data;
  },

  // Reset admin user password
  resetPassword: async (userId: string, newPassword: string): Promise<void> => {
    await axios.put(
      API_ENDPOINTS.ADMIN.USERS.RESET_PASSWORD(userId),
      { newPassword }
    );
  },
};