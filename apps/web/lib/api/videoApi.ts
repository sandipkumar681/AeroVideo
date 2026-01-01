import { BACKEND_URL } from "@/constant";

export interface VideoDetailsResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}

/**
 * Handle API response errors
 */
export const handleResponse = async (response: Response) => {
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
 * Get video details by ID with populated owner information
 */
export const getVideoDetails = async (videoId: string) => {
  const response = await fetch(`${BACKEND_URL}/videos/${videoId}`, {
    credentials: "include",
  });
  return await handleResponse(response);
};

/**
 * Get related videos based on tags
 */
export const getRelatedVideos = async (videoId: string) => {
  const response = await fetch(`${BACKEND_URL}/videos/${videoId}/related`, {
    credentials: "include",
  });
  return await handleResponse(response);
};

/**
 * Search for published videos
 */
export const searchVideos = async (
  query: string,
  page: number = 1,
  limit: number = 10
) => {
  const response = await fetch(
    `${BACKEND_URL}/videos/search?query=${encodeURIComponent(
      query
    )}&page=${page}&limit=${limit}`
  );
  return await handleResponse(response);
};
