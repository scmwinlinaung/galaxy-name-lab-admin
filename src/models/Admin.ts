export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  password: string;
}