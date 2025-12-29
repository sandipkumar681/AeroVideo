import { ApiError } from "../utils/apiError";
import { Like } from "../models/like.models";
import { ILike, ILikeDocument } from "@aerovideo/types";
import mongoose from "mongoose";

// =============================================
// Basic CRUD Functions
// =============================================

/**
 * Create a new like (video only)
 */
export const createLike = async (
  data: Pick<ILike, "likedBy" | "video">
): Promise<ILikeDocument> => {
  try {
    return (await Like.create(data)) as ILikeDocument;
  } catch (error) {
    throw new ApiError(500, `❌ Error in createLike(): ${error}`);
  }
};

/**
 * Find a like by ID
 */
export const findLikeById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ILikeDocument | null> => {
  try {
    return (await Like.findById(_id)) as ILikeDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findLikeById(): ${error}`);
  }
};

/**
 * Find multiple likes with optional filters
 */
export const findLikes = async (
  filter: Record<string, any> = {},
  options: mongoose.QueryOptions = {}
): Promise<ILikeDocument[]> => {
  try {
    return (await Like.find(filter, null, options)) as ILikeDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findLikes(): ${error}`);
  }
};

/**
 * Delete a like by ID
 */
export const deleteLikeById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ILikeDocument | null> => {
  try {
    return (await Like.findByIdAndDelete(_id)) as ILikeDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteLikeById(): ${error}`);
  }
};

// =============================================
// Like-Specific Functions
// =============================================

/**
 * Find likes by user (all likes made by a user)
 */
export const findLikesByUser = async (
  userId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ILikeDocument[]> => {
  try {
    return (await Like.find(
      { likedBy: userId },
      null,
      options
    )) as ILikeDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findLikesByUser(): ${error}`);
  }
};

/**
 * Find likes on a video
 */
export const findLikesByVideo = async (
  videoId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ILikeDocument[]> => {
  try {
    return (await Like.find(
      { video: videoId },
      null,
      options
    )) as ILikeDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findLikesByVideo(): ${error}`);
  }
};

/**
 * Check if user has liked a video
 */
export const hasUserLikedVideo = async (
  userId: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const like = await Like.findOne({ likedBy: userId, video: videoId });
    return like !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in hasUserLikedVideo(): ${error}`);
  }
};

/**
 * Toggle like on a video (like if not liked, unlike if already liked)
 */
export const toggleVideoLike = async (
  userId: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<{ liked: boolean; like?: ILikeDocument }> => {
  try {
    const existingLike = await Like.findOne({
      likedBy: userId,
      video: videoId,
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      return { liked: false };
    } else {
      // Like
      const newLike = (await Like.create({
        likedBy: userId,
        video: videoId,
      })) as ILikeDocument;
      return { liked: true, like: newLike };
    }
  } catch (error) {
    throw new ApiError(500, `❌ Error in toggleVideoLike(): ${error}`);
  }
};

/**
 * Count likes on a video
 */
export const countVideoLikes = async (
  videoId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Like.countDocuments({ video: videoId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countVideoLikes(): ${error}`);
  }
};

/**
 * Delete all likes on a video (cleanup when video is deleted)
 */
export const deleteAllVideoLikes = async (
  videoId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const result = await Like.deleteMany({ video: videoId });
    return result.deletedCount || 0;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteAllVideoLikes(): ${error}`);
  }
};
/**
 * Find all videos liked by a user
 */
export const findUserLikedVideos = async (
  userId: mongoose.Types.ObjectId | string
): Promise<any[]> => {
  try {
    return await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      userName: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: "$owner" },
          ],
        },
      },
      { $unwind: "$video" },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          video: 1,
          createdAt: 1,
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUserLikedVideos(): ${error}`);
  }
};
