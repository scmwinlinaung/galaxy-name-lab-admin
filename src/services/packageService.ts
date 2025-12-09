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
    console.log("token = " + token);
    if (token) {
      config.headers["x-auth-token"] = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error('Authentication error:', error.response.data);
//       // Handle unauthorized - redirect to login
//       localStorage.removeItem('token');
//       // Only redirect if we're not already on the login page
//       if (window.location.pathname !== '/') {
//         console.log('Redirecting to login due to authentication error');
//         window.location.href = '/';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export interface Package {
  id?: string;
  _id?: string; // Add MongoDB _id field
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
  createdAt?: string;
  __v?: number;
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
  id: string;
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

// Helper function to normalize package ID
const normalizePackageId = (pkg: any): Package => {
  return {
    ...pkg,
    id: pkg._id || pkg.id, // Use _id from MongoDB, fallback to id
  };
};

class PackageService {
  async getAllPackages(): Promise<Package[]> {
    try {
      const response = await api.get(API_ENDPOINTS.PACKAGES.GET_ALL);
      console.log("response = " + response.data);
      const packages = Array.isArray(response.data) ? response.data : [];
      return packages.map(normalizePackageId);
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async getPackageById(id: string): Promise<Package> {
    try {
      console.log('Fetching package by ID:', id);
      const response = await api.get(API_ENDPOINTS.PACKAGES.GET_BY_ID(id));
      console.log('Package fetched:', response.data);
      return normalizePackageId(response.data);
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  }

  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    try {
      console.log('Creating package:', packageData);
      const response = await api.post(API_ENDPOINTS.PACKAGES.CREATE, packageData);
      console.log('Package created:', response.data);
      return normalizePackageId(response.data);
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  async updatePackage(id: string, packageData: Omit<UpdatePackageRequest, 'id'>): Promise<Package> {
    try {
      console.log('Updating package with ID:', id);
      // Include the id in the request body as expected by the API
      const updateData: UpdatePackageRequest = {
        id,
        ...packageData,
      };
      console.log('Update data:', updateData);
      const response = await api.put(API_ENDPOINTS.PACKAGES.UPDATE(id), updateData);
      console.log('Package updated response:', response.data);
      return normalizePackageId(response.data);
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  async deletePackage(id: string): Promise<void> {
    try {
      console.log('Deleting package with ID:', id);
      if (!id) {
        throw new Error('Package ID is required for deletion');
      }
      const response = await api.delete(API_ENDPOINTS.PACKAGES.DELETE(id));
      console.log('Package deleted successfully:', response.data);
    } catch (error: any) {
      console.error('Error deleting package:', JSON.stringify(error));
      // Handle 404 gracefully - many APIs return 404 after successful deletion
      if (error.response?.status === 404) {
        // Check if this is a true "not found" error vs successful deletion
        // A true error would typically have an error message in the response
        if (error.response.data?.message || error.response.data?.error) {
          throw new Error('Package not found');
        }
        // If no error message, assume deletion was successful
        console.log('Package deletion confirmed (API returned 404 after deletion)');
        return;
      }
      throw error;
    }
  }
}

export const packageService = new PackageService();