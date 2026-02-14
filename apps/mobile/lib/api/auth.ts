import { apiRequest, ApiResponse } from "./index";

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  avatar?: any;
  coverImage?: any;
}

/**
 * User login
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * User registration
 */
export async function register(userData: FormData): Promise<ApiResponse> {
  return apiRequest("/auth/register", {
    method: "POST",
    headers: {}, // Remove Content-Type for FormData
    body: userData,
  });
}

/**
 * User logout
 */
export async function logout(): Promise<ApiResponse> {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<ApiResponse> {
  return apiRequest("/auth/current-user");
}

/**
 * Request password reset OTP
 */
export async function requestPasswordReset(
  email: string
): Promise<ApiResponse> {
  return apiRequest("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password with OTP
 */
export async function resetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<ApiResponse> {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
