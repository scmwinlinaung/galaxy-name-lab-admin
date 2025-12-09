import api from '../api';
import { API_ENDPOINTS } from '../constants/api';
import { Package, CreatePackageRequest, UpdatePackageRequest } from '../models/Package';

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
      const response = await api.delete(API_ENDPOINTS.PACKAGES.DELETE(id.trim()));
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