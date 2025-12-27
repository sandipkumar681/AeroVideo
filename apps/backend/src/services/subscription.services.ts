import { ApiError } from "../utils/apiError";
import { Subscription } from "../models/subscription.models";
import { ISubscription, ISubscriptionDocument } from "@servicely/types";
import mongoose from "mongoose";

// =============================================
// Basic CRUD Functions
// =============================================

/**
 * Create a new subscription

 */
export const createSubscription = async (
  data: Pick<ISubscription, "subscriber" | "channel">
): Promise<ISubscriptionDocument> => {
  try {
    return (await Subscription.create(data)) as ISubscriptionDocument;
  } catch (error) {
    throw new ApiError(500, `❌ Error in createSubscription(): ${error}`);
  }
};

/**
 * Find a subscription by ID
 */
export const findSubscriptionById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ISubscriptionDocument | null> => {
  try {
    return (await Subscription.findById(_id)) as ISubscriptionDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findSubscriptionById(): ${error}`);
  }
};

/**
 * Find multiple subscriptions with optional filters
 */
export const findSubscriptions = async (
  filter: any = {},
  options: mongoose.QueryOptions = {}
): Promise<ISubscriptionDocument[]> => {
  try {
    return (await Subscription.find(
      filter,
      null,
      options
    )) as ISubscriptionDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findSubscriptions(): ${error}`);
  }
};

/**
 * Delete a subscription by ID
 */
export const deleteSubscriptionById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<ISubscriptionDocument | null> => {
  try {
    return (await Subscription.findByIdAndDelete(
      _id
    )) as ISubscriptionDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteSubscriptionById(): ${error}`);
  }
};

// =============================================
// Subscription-Specific Functions
// =============================================

/**
 * Find all channels a user is subscribed to
 */
export const findUserSubscriptions = async (
  subscriberId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ISubscriptionDocument[]> => {
  try {
    return (await Subscription.find({ subscriber: subscriberId }, null, {
      sort: { createdAt: -1 },
      ...options,
    })) as ISubscriptionDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUserSubscriptions(): ${error}`);
  }
};

/**
 * Find all subscribers of a channel
 */
export const findChannelSubscribers = async (
  channelId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<ISubscriptionDocument[]> => {
  try {
    return (await Subscription.find({ channel: channelId }, null, {
      sort: { createdAt: -1 },
      ...options,
    })) as ISubscriptionDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findChannelSubscribers(): ${error}`);
  }
};

/**
 * Check if user is subscribed to a channel
 */
export const isUserSubscribed = async (
  subscriberId: mongoose.Types.ObjectId | string,
  channelId: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const subscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });
    return subscription !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in isUserSubscribed(): ${error}`);
  }
};

/**
 * Toggle subscription (subscribe if not subscribed, unsubscribe if subscribed)
 */
export const toggleSubscription = async (
  subscriberId: mongoose.Types.ObjectId | string,
  channelId: mongoose.Types.ObjectId | string
): Promise<{
  subscribed: boolean;
  subscription?: ISubscriptionDocument;
}> => {
  try {
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return { subscribed: false };
    } else {
      // Subscribe
      const newSubscription = (await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
      })) as ISubscriptionDocument;
      return { subscribed: true, subscription: newSubscription };
    }
  } catch (error) {
    throw new ApiError(500, `❌ Error in toggleSubscription(): ${error}`);
  }
};

/**
 * Count total subscribers of a channel
 */
export const countChannelSubscribers = async (
  channelId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Subscription.countDocuments({ channel: channelId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countChannelSubscribers(): ${error}`);
  }
};

/**
 * Count total channels a user is subscribed to
 */
export const countUserSubscriptions = async (
  subscriberId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Subscription.countDocuments({ subscriber: subscriberId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countUserSubscriptions(): ${error}`);
  }
};

/**
 * Delete all subscriptions to a channel (cleanup when channel/user is deleted)
 */
export const deleteAllChannelSubscriptions = async (
  channelId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const result = await Subscription.deleteMany({ channel: channelId });
    return result.deletedCount || 0;
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in deleteAllChannelSubscriptions(): ${error}`
    );
  }
};

/**
 * Delete all subscriptions by a user (cleanup when user is deleted)
 */
export const deleteAllUserSubscriptions = async (
  subscriberId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const result = await Subscription.deleteMany({ subscriber: subscriberId });
    return result.deletedCount || 0;
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in deleteAllUserSubscriptions(): ${error}`
    );
  }
};

/**
 * Get all channels a user is subscribed to with channel details and subscriber counts
 * Optimized with aggregation to avoid N+1 query problem
 */
export const findUserSubscribedChannelsWithStats = async (
  subscriberId: mongoose.Types.ObjectId | string
): Promise<any[]> => {
  try {
    return await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelDetails",
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
        $unwind: "$channelDetails",
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "channel",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $addFields: {
          "channelDetails.subscriberCount": { $size: "$subscribers" },
        },
      },
      {
        $project: {
          _id: 1,
          channel: "$channelDetails",
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in findUserSubscribedChannelsWithStats(): ${error}`
    );
  }
};
