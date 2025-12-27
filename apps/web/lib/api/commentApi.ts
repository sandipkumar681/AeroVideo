import { BACKEND_URL } from "@/constant";

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
 * Get all comments for a video
 */
export const getVideoComments = async (videoId: string) => {
  const response = await fetch(`${BACKEND_URL}/comments/all/${videoId}`);
  return await handleResponse(response);
};

/**
 * Add a new comment to a video
 */
export const addComment = async (videoId: string, content: string) => {
  const response = await fetch(`${BACKEND_URL}/comments/add/${videoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  return await handleResponse(response);
};

/**
 * Update an existing comment
 */
export const updateComment = async (commentId: string, content: string) => {
  const response = await fetch(`${BACKEND_URL}/comments/edit/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  return await handleResponse(response);
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string) => {
  const response = await fetch(`${BACKEND_URL}/comments/delete/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return await handleResponse(response);
};
