import { Package } from './Package';

export interface BusinessInfo {
  businessName: string;
  dateOfBirth: string;
}

export interface PaymentInfo {
  paymentId: string;
  gateway: string;
  status: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// User object returned in orders (different from AdminUser)
export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface OrderPackageReference {
  _id: string;
}

export interface Order {
  _id: string;
  user: OrderUser;
  package: OrderPackageReference;
  businessInfo: BusinessInfo;
  status: OrderStatus;
  payment: PaymentInfo;
  pdfPath?: string;
  createdAt: string;
  __v?: number;
}

export interface CreateOrderRequest {
  user: string;
  package: string;
  businessInfo: BusinessInfo;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  pdfPath?: string;
}

export interface GetOrdersParams {
  search?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}