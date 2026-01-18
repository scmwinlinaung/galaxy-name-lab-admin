
import api from '../api';
import { API_ENDPOINTS } from '../constants/api';
import { Admin, CreateAdminRequest } from '../models/Admin';
import { hashStringWithSha512 } from '../utils/cn';

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
    const hashedPassword = hashStringWithSha512(password);
    await api.put(API_ENDPOINTS.ADMIN.ADMINS.RESET_PASSWORD(id), { 
      password: hashedPassword
     });
  },
};