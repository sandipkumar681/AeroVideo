import { BACKEND_URL } from "@/constant";
import { handleResponse } from "./videoApi";
import { IVideo } from "@servicely/types";

export interface LikedVideo {
  _id: string;
  video: IVideo;
  createdAt: string;
}

/**
 * Fetch all videos liked by the current user
 */
export const getLikedVideos = async (): Promise<LikedVideo[]> => {
  const response = await fetch(`${BACKEND_URL}/likes/liked-videos`, {
    method: "GET",
    credentials: "include",
  });
  const data = await handleResponse(response);
  return data.data;
};

/**
 * Toggle like status on a video
 */
export const toggleLike = async (videoId: string) => {
  const response = await fetch(`${BACKEND_URL}/likes/video/${videoId}`, {
    method: "POST",
    credentials: "include",
  });
  return await handleResponse(response);
};
