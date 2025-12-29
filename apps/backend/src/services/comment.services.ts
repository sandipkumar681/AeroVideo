import { ApiError } from "../utils/apiError";
import { Comment } from "../models/comment.models";
import { IComment, ICommentDocument } from "@aerovideo/types";
import mongoose from "mongoose";

// =============================================
// Basic CRUD Functions
// =============================================

/**
 * Create a new comment
 */
export const createComment = async (
  data: Pick<IComment, "content" | "video" | "user">
): Promise<ICommentDocument> => {
  try {
    return (await Comment.create(data)) as ICommentDocument;
  } catch (error) {
    throw new ApiError(500, `❌ Error in createComment(): ${error}`);
  }
};

/**
 * Find a comment by ID
 */
export const findCommentById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ICommentDocument | null> => {
  try {
    return (await Comment.findById(_id)) as ICommentDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findCommentById(): ${error}`);
  }
};

/**
 * Find multiple comments with optional filters
 */
export const findComments = async (
  filter: Record<string, any> = {},
  options: mongoose.QueryOptions = {}
): Promise<ICommentDocument[]> => {
  try {
    return (await Comment.find(filter, null, options)) as ICommentDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findComments(): ${error}`);
  }
};

/**
 * Update a comment by ID
 */
export const updateCommentById = async (
  _id: mongoose.Types.ObjectId | string,
  update: mongoose.UpdateQuery<IComment>,
  options: mongoose.QueryOptions = {}
): Promise<ICommentDocument | null> => {
  try {
    return (await Comment.findByIdAndUpdate(
      _id,
      update,
      options
    )) as ICommentDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateCommentById(): ${error}`);
  }
};

/**
 * Update comment content
 */
export const updateCommentContent = async (
  _id: mongoose.Types.ObjectId | string,
  content: string
): Promise<ICommentDocument | null> => {
  try {
    return (await Comment.findByIdAndUpdate(
      _id,
      { $set: { content: content.trim() } },
      { new: true }
    )) as ICommentDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateCommentContent(): ${error}`);
  }
};

/**
 * Delete a comment by ID
 */
export const deleteCommentById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ICommentDocument | null> => {
  try {
    return (await Comment.findByIdAndDelete(_id)) as ICommentDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteCommentById(): ${error}`);
  }
};

// =============================================
// Comment-Specific Functions
// =============================================

/**
 * Find comments on a video
 */
export const findCommentsByVideo = async (
  videoId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ICommentDocument[]> => {
  try {
    return (await Comment.find({ video: videoId }, null, {
      sort: { createdAt: -1 },
      ...options,
    })) as ICommentDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findCommentsByVideo(): ${error}`);
  }
};

/**
 * Find comments by a user
 */
export const findCommentsByUser = async (
  userId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ICommentDocument[]> => {
  try {
    return (await Comment.find({ user: userId }, null, {
      sort: { createdAt: -1 },
      ...options,
    })) as ICommentDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findCommentsByUser(): ${error}`);
  }
};

/**
 * Find a specific user's comment on a video
 */
export const findUserCommentOnVideo = async (
  videoId: mongoose.Types.ObjectId | string,
  userId: mongoose.Types.ObjectId | string
): Promise<ICommentDocument | null> => {
  try {
    return (await Comment.findOne({
      video: videoId,
      user: userId,
    })) as ICommentDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUserCommentOnVideo(): ${error}`);
  }
};

/**
 * Count comments on a video
 */
export const countVideoComments = async (
  videoId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Comment.countDocuments({ video: videoId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countVideoComments(): ${error}`);
  }
};

/**
 * Count comments by a user
 */
export const countUserComments = async (
  userId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Comment.countDocuments({ user: userId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countUserComments(): ${error}`);
  }
};

/**
 * Delete all comments on a video (cleanup when video is deleted)
 */
export const deleteAllVideoComments = async (
  videoId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const result = await Comment.deleteMany({ video: videoId });
    return result.deletedCount || 0;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteAllVideoComments(): ${error}`);
  }
};

/**
 * Delete all comments by a user (cleanup when user is deleted)
 */
export const deleteAllUserComments = async (
  userId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const result = await Comment.deleteMany({ user: userId });
    return result.deletedCount || 0;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteAllUserComments(): ${error}`);
  }
};

/**
 * Check if comment exists
 */
export const commentExists = async (
  _id: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const comment = await Comment.exists({ _id });
    return comment !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in commentExists(): ${error}`);
  }
};

/**
 * Get all comments on a video with user details
 * Optimized with aggregation to avoid N+1 population overhead
 */
export const findCommentsByVideoWithUser = async (
  videoId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<any[]> => {
  try {
    return await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
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
      {
        $unwind: "$user",
      },
      {
        $sort: { createdAt: -1 },
      },
      ...(options.limit ? [{ $limit: options.limit }] : []),
      ...(options.skip ? [{ $skip: options.skip }] : []),
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in findCommentsByVideoWithUser(): ${error}`
    );
  }
};
