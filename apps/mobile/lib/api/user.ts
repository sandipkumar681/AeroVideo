import { apiRequest, ApiResponse } from "./index";

/**
 * Get user channel by username
 */
export async function getUserChannel(userName: string): Promise<ApiResponse> {
  return apiRequest(`/users/c/${userName}`);
}

/**
 * Get user watch history
 */
export async function getWatchHistory(): Promise<ApiResponse> {
  return apiRequest("/users/history");
}

/**
 * Clear watch history
 */
export async function clearWatchHistory(): Promise<ApiResponse> {
  return apiRequest("/users/history", {
    method: "DELETE",
  });
}

/**
 * Get liked videos
 */
export async function getLikedVideos(): Promise<ApiResponse> {
  return apiRequest("/likes/videos");
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData): Promise<ApiResponse> {
  return apiRequest("/users/update-account", {
    method: "PATCH",
    headers: {}, // Remove Content-Type for FormData
    body: formData,
  });
}

/**
 * Update avatar
 */
export async function updateAvatar(formData: FormData): Promise<ApiResponse> {
  return apiRequest("/users/avatar", {
    method: "PATCH",
    headers: {},
    body: formData,
  });
}

/**
 * Update cover image
 */
export async function updateCoverImage(
  formData: FormData
): Promise<ApiResponse> {
  return apiRequest("/users/cover-image", {
    method: "PATCH",
    headers: {},
    body: formData,
  });
}

/**
 * Toggle channel subscription
 */
export async function toggleSubscription(
  channelId: string
): Promise<ApiResponse> {
  return apiRequest(`/subscriptions/c/${channelId}`, {
    method: "POST",
  });
}

/**
 * Get user subscriptions
 */
export async function getUserSubscriptions(): Promise<ApiResponse> {
  return apiRequest("/subscriptions/");
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(): Promise<ApiResponse> {
  return apiRequest("/dashboard/stats");
}

/**
 * Get channel videos
 */
export async function getChannelVideos(): Promise<ApiResponse> {
  return apiRequest("/dashboard/videos");
}
