export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// User object in submission
export interface SubmissionUser {
  _id: string;
  name: string;
  email: string;
}

// Order reference in submission
export interface SubmissionOrder {
  _id: string;
}

// Submission interface
export interface Submission {
  _id: string;
  user: SubmissionUser;
  order: SubmissionOrder;
  status: SubmissionStatus;
  userPdfPath?: string;
  adminPdfPath?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Request types
export interface UpdateSubmissionRequest {
  status?: SubmissionStatus;
  adminComment?: string;
  file?: File;
}

// Response types
export interface SubmissionResponse {
  success: boolean;
  data?: Submission;
  message?: string;
}
