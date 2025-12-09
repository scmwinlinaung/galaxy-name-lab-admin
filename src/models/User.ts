export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}