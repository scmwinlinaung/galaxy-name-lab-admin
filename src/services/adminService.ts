
import api from '../api';
import { API_ENDPOINTS } from '../constants/api';
import { Admin, CreateAdminRequest, ResetPasswordRequest } from '../models/Admin';

export const adminService = {
  getAllAdmins: async (): Promise<Admin[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.ADMINS.GET_ALL);
    return response.data;
  },

  createAdmin: async (adminData: CreateAdminRequest): Promise<Admin> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.ADMINS.CREATE, adminData);
    return response.data;
  },

  resetPassword: async (id: string, password: string): Promise<void> => {
    console.log("id = " + id);
    console.log("password = " + password)
    await api.put(API_ENDPOINTS.ADMIN.ADMINS.RESET_PASSWORD(id), { password });
  },
};