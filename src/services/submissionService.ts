import { API_ENDPOINTS } from '../constants/api';
import api from '../api';
import {
  Submission,
  UpdateSubmissionRequest,
} from '../models/Submission';

// Submission management functions
export const submissionService = {
  // Get all submissions
  getAllSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.SUBMISSIONS.GET_ALL);
    console.log('Submissions response:', response.data);
    return response.data;
  },

  // Get submissions by order ID
  getSubmissionsByOrder: async (orderId: string): Promise<Submission[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.SUBMISSIONS.GET_BY_ORDER(orderId));
    return response.data;
  },

  // Update submission status and comment (Admin) - multipart/form-data
  updateSubmission: async (
    submissionId: string,
    updateData: UpdateSubmissionRequest
  ): Promise<Submission> => {
    const formData = new FormData();

    if (updateData.status !== undefined) {
      formData.append('status', updateData.status);
    }
    if (updateData.adminComment !== undefined) {
      formData.append('adminComment', updateData.adminComment);
    }
    if (updateData.file !== undefined) {
      formData.append('file', updateData.file);
    }

    const response = await api.put(
      API_ENDPOINTS.ADMIN.SUBMISSIONS.UPDATE(submissionId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Download admin's response PDF
  downloadAdminPdf: async (submissionId: string): Promise<void> => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.SUBMISSIONS.DOWNLOAD_ADMIN(submissionId),
        {
          responseType: 'blob',
        }
      );

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a temporary anchor element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `submission-admin-${submissionId}.pdf`;

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

  // Download user's original PDF (Admin only)
  downloadUserPdf: async (submissionId: string): Promise<void> => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.SUBMISSIONS.DOWNLOAD_USER(submissionId),
        {
          responseType: 'blob',
        }
      );

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a temporary anchor element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `submission-user-${submissionId}.pdf`;

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
