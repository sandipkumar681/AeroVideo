import { Video } from "../models/video.models";
import { User } from "../models/user.models";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";

/**
 * Get channel statistics (total views, subscribers, videos, likes, comments)
 */
export const getChannelStats = async (userName: string) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          userName: userName.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videos",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesCount",
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentsCount",
              },
            },
            {
              $addFields: {
                likesCount: {
                  $size: "$likesCount",
                },
                commentsCount: {
                  $size: "$commentsCount",
                },
              },
            },
            {
              $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalLikes: {
                  $sum: "$likesCount",
                },
                totalComments: {
                  $sum: "$commentsCount",
                },
                totalViews: { $sum: "$views" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalSubscribers: {
            $size: "$subscribers",
          },
          channelInfo: { $first: "$videos" },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          userName: 1,
          totalSubscribers: 1,
          channelInfo: 1,
        },
      },
    ]);

    return stats[0] || null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in getChannelStats service: ${error}`);
  }
};

/**
 * Get public channel statistics (total views, subscribers, videos)
 */
export const getPublicChannelStats = async (userName: string) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          userName: userName.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videos",
          pipeline: [
            {
              $match: { isPublished: true },
            },
            {
              $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalSubscribers: {
            $size: "$subscribers",
          },
          channelInfo: { $first: "$videos" },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          userName: 1,
          avatar: 1,
          coverImage: 1,
          totalSubscribers: 1,
          channelInfo: 1,
        },
      },
    ]);

    return stats[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in getPublicChannelStats service: ${error}`
    );
  }
};

/**
 * Get all videos for a channel with metadata (likes, comments, subs)
 */
export const getChannelVideos = async (
  userId: string | mongoose.Types.ObjectId
) => {
  try {
    return await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
              },
            },
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
                fullName: 1,
                subscribers: { $size: "$subscribers" },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          owner: { $first: "$owner" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  } catch (error) {
    throw new ApiError(500, `❌ Error in getChannelVideos service: ${error}`);
  }
};

/**
 * Get public videos for a channel (published only)
 */
export const getPublicChannelVideos = async (
  userId: string | mongoose.Types.ObjectId
) => {
  try {
    return await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
          isPublished: true,
        },
      },
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
                avatar: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in getPublicChannelVideos service: ${error}`
    );
  }
};
