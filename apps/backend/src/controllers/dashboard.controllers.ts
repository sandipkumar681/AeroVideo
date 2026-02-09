import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types/other.types";
import * as dashboardService from "../services/dashboard.services";
import { Request, Response } from "express";
import { getSignedUrl } from "../services/upload.services";
import { isUserSubscribed } from "../services/subscription.services";

const getChannelStats = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const stats = await dashboardService.getChannelStats(req.user.userName);

  if (!stats) {
    throw new ApiError(404, "Channel stats not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "User channel stats fetched successfully!"),
    );
});

const getChannelVideos = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const videos = await dashboardService.getChannelVideos(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          videos,
          videos.length > 0
            ? "Channel videos fetched successfully!"
            : "No videos uploaded yet!",
        ),
      );
  },
);

const getPublicChannelProfile = AsyncHandler(
  async (req: AuthenticatedRequest | Request, res: Response) => {
    const { userName } = req.params as { userName: string };

    if (!userName) {
      throw new ApiError(400, "Username is required!");
    }

    const stats = await dashboardService.getPublicChannelStats(userName);

    if (!stats) {
      throw new ApiError(404, "Channel not found!");
    }

    // Sign avatar and cover image
    if (stats.avatar) {
      stats.avatar = await getSignedUrl(stats.avatar);
    }
    if (stats.coverImage) {
      stats.coverImage = await getSignedUrl(stats.coverImage);
    }

    // Get videos for this channel
    const videos = await dashboardService.getPublicChannelVideos(stats._id);

    // Sign video thumbnails
    const videosWithSignedUrls = await Promise.all(
      videos.map(async (v: any) => {
        if (v.thumbnail) {
          v.thumbnail = await getSignedUrl(v.thumbnail);
        }
        return v;
      }),
    );

    // Check subscription status if user is logged in
    let isSubscribedStatus = false;
    if ("user" in req && req.user) {
      isSubscribedStatus = await isUserSubscribed(req.user._id, stats._id);
    }

    const responseData = {
      ...stats,
      videos: videosWithSignedUrls,
      isSubscribed: isSubscribedStatus,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          "Public channel profile fetched successfully!",
        ),
      );
  },
);

export { getChannelStats, getChannelVideos, getPublicChannelProfile };
