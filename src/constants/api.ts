
import { API_HOST } from "../api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_HOST}/auth/login`,
    // Add other auth endpoints here as needed
  },
  PACKAGES: {
    GET_ALL: `${API_HOST}/packages`,
    CREATE: `${API_HOST}/packages`,
    GET_BY_ID: (id: string) => `${API_HOST}/packages/${id}`,
    UPDATE: (id: string) => `${API_HOST}/packages/${id}`,
    DELETE: (id: string) => `${API_HOST}/packages/${id}`,
  },
  ADMIN: {
    ORDERS: {
      GET_ALL: `${API_HOST}/admin/orders`,
      CREATE: `${API_HOST}/admin/orders`,
      UPDATE: (orderId: string) => `${API_HOST}/admin/orders/${orderId}`,
      DELETE: (orderId: string) => `${API_HOST}/admin/orders/${orderId}`,
      UPLOAD_PDF: (orderId: string) => `${API_HOST}/admin/orders/${orderId}/upload`,
      CONFIRM: (orderId: string) => `${API_HOST}/admin/orders/${orderId}/confirm`,
      DOWNLOAD_PDF: (orderId: string) => `${API_HOST}/admin/orders/${orderId}/download`,
    },
    ADMINS: {
      GET_ALL: `${API_HOST}/admin/admins`,
      CREATE: `${API_HOST}/admin/create`,
      RESET_PASSWORD: (id: string) => `${API_HOST}/admin/reset-password/${id}`,
    },
    SUBMISSIONS: {
      GET_ALL: `${API_HOST}/submissions`,
      GET_BY_ORDER: (orderId: string) => `${API_HOST}/submissions/order/${orderId}`,
      UPDATE: (submissionId: string) => `${API_HOST}/submissions/${submissionId}`,
      DOWNLOAD_ADMIN: (id: string) => `${API_HOST}/submissions/${id}/download-admin`,
      DOWNLOAD_USER: (id: string) => `${API_HOST}/submissions/${id}/download-user`,
    },
  },
  // Add other API endpoints here as needed
}