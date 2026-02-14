import { apiRequest, ApiResponse } from "./index";
import { ITEMS_PER_PAGE } from "@/constants/config";

/**
 * Get all published videos
 */
export async function getPublishedVideos(
  page: number = 1,
  limit: number = ITEMS_PER_PAGE
): Promise<ApiResponse> {
  return apiRequest(`/videos/published?page=${page}&limit=${limit}`);
}

/**
 * Get video by ID
 */
export async function getVideoById(videoId: string): Promise<ApiResponse> {
  return apiRequest(`/videos/${videoId}`);
}

/**
 * Get related videos
 */
export async function getRelatedVideos(videoId: string): Promise<ApiResponse> {
  return apiRequest(`/videos/${videoId}/related`);
}

/**
 * Search videos
 */
export async function searchVideos(
  query: string,
  page: number = 1,
  limit: number = ITEMS_PER_PAGE
): Promise<ApiResponse> {
  const encodedQuery = encodeURIComponent(query);
  return apiRequest(
    `/videos/search?query=${encodedQuery}&page=${page}&limit=${limit}`
  );
}

/**
 * Upload video
 */
export async function uploadVideo(formData: FormData): Promise<ApiResponse> {
  return apiRequest("/videos/upload", {
    method: "POST",
    headers: {}, // Remove Content-Type for FormData
    body: formData,
  });
}

/**
 * Update video
 */
export async function updateVideo(
  videoId: string,
  data: any
): Promise<ApiResponse> {
  return apiRequest(`/videos/${videoId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete video
 */
export async function deleteVideo(videoId: string): Promise<ApiResponse> {
  return apiRequest(`/videos/${videoId}`, {
    method: "DELETE",
  });
}

/**
 * Toggle video like
 */
export async function toggleVideoLike(videoId: string): Promise<ApiResponse> {
  return apiRequest(`/likes/toggle/v/${videoId}`, {
    method: "POST",
  });
}

/**
 * Get video comments
 */
export async function getVideoComments(
  videoId: string,
  page: number = 1,
  limit: number = ITEMS_PER_PAGE
): Promise<ApiResponse> {
  return apiRequest(`/comments/${videoId}?page=${page}&limit=${limit}`);
}

/**
 * Add comment to video
 */
export async function addComment(
  videoId: string,
  content: string
): Promise<ApiResponse> {
  return apiRequest(`/comments/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string): Promise<ApiResponse> {
  return apiRequest(`/comments/c/${commentId}`, {
    method: "DELETE",
  });
}
