import { BACKEND_URL } from "@/constant";
import {
  LoginBody,
  RegisterBody,
  changeAccountDetailsBody,
  changeCurrentPasswordBody,
} from "@servicely/types";

/**
 * Handle API response errors
 */
const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return null;
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
};

/**
 * Check authentication status
 */
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/users/auth/status`, {
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get current user details
 */
export const getUserDetails = async () => {
  const response = await fetch(`${BACKEND_URL}/users/user-details`, {
    credentials: "include",
  });
  return await handleResponse(response);
};

/**
 * Refresh authentication tokens
 */
export const refreshTokens = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/users/refresh-tokens`, {
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Log out the current user
 */
export const logoutUser = async () => {
  const response = await fetch(`${BACKEND_URL}/users/logout`, {
    method: "GET",
    credentials: "include",
  });
  return await handleResponse(response);
};

/**
 * Log in a user
 */
export const loginUser = async (credentials: LoginBody) => {
  const response = await fetch(`${BACKEND_URL}/users/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse(response);
};

/**
 * Register a new user
 */
export const registerUser = async (data: FormData) => {
  const response = await fetch(`${BACKEND_URL}/users/register`, {
    method: "POST",
    body: data,
  });
  return await handleResponse(response);
};

/**
 * Send OTP for registration or profile update
 */
export const sendOtp = async (
  email: string,
  toCreateProfile: boolean = true
) => {
  const response = await fetch(`${BACKEND_URL}/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ToCreateProfile: toCreateProfile, email }),
  });
  return await handleResponse(response);
};

/**
 * Update user avatar
 */
export const updateAvatar = async (avatarFile: File) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await fetch(`${BACKEND_URL}/users/update-avatar`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  return await handleResponse(response);
};

/**
 * Update user cover image
 */
export const updateCoverImage = async (coverFile: File) => {
  const formData = new FormData();
  formData.append("coverImage", coverFile);

  const response = await fetch(`${BACKEND_URL}/users/update-coverImage`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  return await handleResponse(response);
};

/**
 * Update account details
 */
export const updateAccountDetails = async (
  details: changeAccountDetailsBody
) => {
  const response = await fetch(`${BACKEND_URL}/users/update-details`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });
  return await handleResponse(response);
};

/**
 * Change current user password
 */
export const changePassword = async (passwords: changeCurrentPasswordBody) => {
  const response = await fetch(`${BACKEND_URL}/users/change-password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwords),
  });
  return await handleResponse(response);
};

/**
 * Get public channel profile by username
 */
export const getChannelProfile = async (userName: string) => {
  const response = await fetch(`${BACKEND_URL}/users/c/${userName}`, {
    method: "GET",
    credentials: "include",
  });
  return await handleResponse(response);
};

/**
 * Get current user's watch history
 */
export const getWatchHistory = async () => {
  const response = await fetch(`${BACKEND_URL}/users/watch-history`, {
    method: "GET",
    credentials: "include",
  });
  return await handleResponse(response);
};
