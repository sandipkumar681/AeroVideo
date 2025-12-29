import { ApiError } from "../utils/apiError";
import { Video } from "../models/video.models";
import { IVideo, IVideoDocument } from "@aerovideo/types";
import mongoose from "mongoose";
import { getSignedUrl } from "./upload.services";
import { sanitizeVideo } from "../helpers/sanitezResponse.helpers";

// =============================================
// Basic CRUD Functions
// =============================================

/**
 * Create a new video
 */
export const createVideo = async (
  data: Pick<
    IVideo,
    "videoFile" | "thumbnail" | "title" | "description" | "duration" | "owner"
  > &
    Partial<Pick<IVideo, "isPublished" | "tag">>
) => {
  try {
    await Video.create(data);
  } catch (error) {
    throw new ApiError(500, `❌ Error in createVideo(): ${error}`);
  }
};

/**
 * Find a video by ID
 */
export const findVideoById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findById(_id)) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findVideoById(): ${error}`);
  }
};

/**
 * Find multiple videos with optional filters
 */
export const findVideos = async (
  filter: any = {},
  options: mongoose.QueryOptions = {}
): Promise<IVideoDocument[]> => {
  try {
    return (await Video.find(filter, null, options)) as IVideoDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findVideos(): ${error}`);
  }
};

/**
 * Find and update a video by ID
 */
export const findVideoByIdAndUpdate = async (
  _id: mongoose.Types.ObjectId | string,
  update: mongoose.UpdateQuery<IVideo>,
  options: mongoose.QueryOptions = {}
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      update,
      options
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findVideoByIdAndUpdate(): ${error}`);
  }
};

/**
 * Update specific fields of a video (with new=true by default to return updated doc)
 */
export const updateVideoFields = async (
  _id: mongoose.Types.ObjectId | string,
  fields: Partial<IVideo>
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      { $set: fields },
      { new: true }
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateVideoFields(): ${error}`);
  }
};

/**
 * Delete a video by ID
 */
export const deleteVideoById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndDelete(_id)) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteVideoById(): ${error}`);
  }
};

// =============================================
// Video-Specific Functions
// =============================================

/**
 * Find all videos by a specific owner
 */
export const findVideosByOwner = async (
  ownerId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<IVideoDocument[]> => {
  try {
    return (await Video.find(
      { owner: ownerId },
      null,
      options
    )) as IVideoDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findVideosByOwner(): ${error}`);
  }
};

/**
 * Find published videos
 */
export const findPublishedVideos = async (
  options: mongoose.QueryOptions = {}
): Promise<IVideoDocument[]> => {
  try {
    return (await Video.find(
      { isPublished: true },
      null,
      options
    )) as IVideoDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findPublishedVideos(): ${error}`);
  }
};

/**
 * Update publish status of a video
 */
export const updatePublishStatus = async (
  _id: mongoose.Types.ObjectId | string,
  isPublished: boolean
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      { $set: { isPublished } },
      { new: true }
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updatePublishStatus(): ${error}`);
  }
};

/**
 * Increment view count for a video
 */
export const incrementViews = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      { $inc: { views: 1 } },
      { new: true }
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in incrementViews(): ${error}`);
  }
};

/**
 * Find videos by tags (videos that contain at least one of the provided tags)
 */
export const findVideosByTags = async (
  tags: string[],
  options: mongoose.QueryOptions = {}
): Promise<IVideoDocument[]> => {
  try {
    return (await Video.find(
      { tag: { $in: tags } },
      null,
      options
    )) as IVideoDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findVideosByTags(): ${error}`);
  }
};

/**
 * Add tags to a video (avoids duplicates using $addToSet)
 */
export const addTagsToVideo = async (
  _id: mongoose.Types.ObjectId | string,
  tags: string[]
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      { $addToSet: { tag: { $each: tags } } },
      { new: true }
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in addTagsToVideo(): ${error}`);
  }
};

/**
 * Remove tags from a video
 */
export const removeTagsFromVideo = async (
  _id: mongoose.Types.ObjectId | string,
  tags: string[]
): Promise<IVideoDocument | null> => {
  try {
    return (await Video.findByIdAndUpdate(
      _id,
      { $pull: { tag: { $in: tags } } },
      { new: true }
    )) as IVideoDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in removeTagsFromVideo(): ${error}`);
  }
};

/**
 * Check if video exists by ID
 */
export const videoExists = async (
  _id: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const video = await Video.exists({ _id });
    return video !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in videoExists(): ${error}`);
  }
};

/**
 * Count total videos (with optional filter)
 */
export const countVideos = async (filter: any = {}): Promise<number> => {
  try {
    return await Video.countDocuments(filter);
  } catch (error) {
    throw new ApiError(500, `❌ Error in countVideos(): ${error}`);
  }
};

/**
 * Utility to sanitize multiple videos and generate signed URLs
 */
export const getVideosWithSignedUrls = async (
  videos: IVideoDocument[],
  isOwner: boolean = false
) => {
  return await Promise.all(
    videos.map(async (v) => {
      const videoObj = sanitizeVideo(v, isOwner);

      if (videoObj.videoFile) {
        videoObj.videoFile = await getSignedUrl(videoObj.videoFile);
      }
      if (videoObj.thumbnail) {
        videoObj.thumbnail = await getSignedUrl(videoObj.thumbnail);
      }

      // Handle owner avatar if populated
      if (
        videoObj.owner &&
        typeof videoObj.owner === "object" &&
        "avatar" in videoObj.owner &&
        videoObj.owner.avatar
      ) {
        videoObj.owner.avatar = await getSignedUrl(videoObj.owner.avatar);
      }

      return videoObj;
    })
  );
};
