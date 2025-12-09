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
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pdfPath?: string;
}