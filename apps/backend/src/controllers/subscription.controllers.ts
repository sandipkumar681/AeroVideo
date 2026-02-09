import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types/other.types";
import {
  toggleSubscription,
  countChannelSubscribers,
  findUserSubscriptions,
  findUserSubscribedChannelsWithStats,
} from "../services/subscription.services";
import { findUserWithId } from "../services/user.services";
import { getSignedUrl } from "../services/upload.services";
import mongoose from "mongoose";
import { Request, Response } from "express";
const toggleUserSubscription = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { channelId } = req.params as { channelId: string };

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required!");
    }

    if (!mongoose.isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel ID!");
    }

    // Check if channel exists
    const channel = await findUserWithId(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel does not exist!");
    }

    const result = await toggleSubscription(req.user._id, channelId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: result.subscribed },
          `Successfully ${
            result.subscribed ? "subscribed to" : "unsubscribed from"
          } channel!`,
        ),
      );
  },
);

const getUserChannelSubscribers = AsyncHandler(
  async (req: Request, res: Response) => {
    const { channelId } = req.params as { channelId: string };

    if (!channelId) {
      throw new ApiError(400, "Channel ID is required!");
    }

    if (!mongoose.isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel ID!");
    }

    const subscriberCount = await countChannelSubscribers(channelId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: subscriberCount },
          "Subscribers count fetched successfully!",
        ),
      );
  },
);

const getSubscribedChannels = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const subscriptions = await findUserSubscribedChannelsWithStats(
      req.user._id,
    );

    if (subscriptions.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            [],
            "You haven't subscribed to any channels yet!",
          ),
        );
    }

    // Generate signed URLs for channel avatars
    const subscriptionsWithSignedUrls = await Promise.all(
      subscriptions.map(async (sub) => {
        if (sub.channel?.avatar) {
          sub.channel.avatar = await getSignedUrl(sub.channel.avatar);
        }
        return sub;
      }),
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriptionsWithSignedUrls,
          "Subscribed channels fetched successfully!",
        ),
      );
  },
);

export {
  toggleUserSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
