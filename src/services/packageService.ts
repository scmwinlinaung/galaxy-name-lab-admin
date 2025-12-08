import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

// Create axios instance with auth headers
const api = axios.create({
  baseURL: 'http://18.139.99.95/name-lab/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  path: string;
  isPopular: boolean;
  deliverables: string;
  submissionLimit: number;
  submissionDurationDays: number;
  expectedOutcome: string;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  path: string;
  isPopular: boolean;
  deliverables: string;
  submissionLimit: number;
  submissionDurationDays: number;
  expectedOutcome: string;
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  path?: string;
  isPopular?: boolean;
  deliverables?: string;
  submissionLimit?: number;
  submissionDurationDays?: number;
  expectedOutcome?: string;
}

class PackageService {
  async getAllPackages(): Promise<Package[]> {
    try {
      const response = await api.get(API_ENDPOINTS.PACKAGES.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async getPackageById(id: string): Promise<Package> {
    try {
      const response = await api.get(API_ENDPOINTS.PACKAGES.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  }

  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    try {
      const response = await api.post(API_ENDPOINTS.PACKAGES.CREATE, packageData);
      return response.data;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  async updatePackage(id: string, packageData: UpdatePackageRequest): Promise<Package> {
    try {
      const response = await api.put(API_ENDPOINTS.PACKAGES.UPDATE(id), packageData);
      return response.data;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  async deletePackage(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.PACKAGES.DELETE(id));
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }
}

export const packageService = new PackageService();