import { ApiError } from "../utils/apiError";
import { User } from "../models/user.models";
import { IUser, IUserDocument } from "@aerovideo/types";
import mongoose from "mongoose";

export const authFindUser = async (
  identifier: string | Pick<IUser, "userName" | "email">
): Promise<IUserDocument | null> => {
  try {
    if (typeof identifier === "string") {
      // login case
      return User.findOne({
        $or: [{ userName: identifier.toLowerCase() }, { email: identifier }],
      }) as Promise<IUserDocument | null>;
    }

    // registration case
    const { userName, email } = identifier;

    return User.findOne({
      $or: [{ userName: userName.toLowerCase() }, { email }],
    }) as Promise<IUserDocument | null>;
  } catch (error) {
    throw new ApiError(500, `❌ Error in authFindUser(): ${error}`);
  }
};

export const createUser = async (
  data: Pick<
    IUser,
    "fullName" | "userName" | "email" | "password" | "avatar" | "coverImage"
  >
) => {
  try {
    const { fullName, userName, email, password, avatar, coverImage } = data;
    return await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
      avatar,
      coverImage,
    });
  } catch (error) {
    throw new ApiError(500, `❌ Error in createUser(): ${error}`);
  }
};

export const findUserWithId = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findById(_id)) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, "Database error while finding user by id");
  }
};

export const findOneUser = async (
  data: string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findOne({ data })) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `"❌ Error in findOneUser(): ${error}`);
  }
};

export const findAndUpdateUserWithId = async (
  _id: mongoose.Types.ObjectId | string,
  update: mongoose.UpdateQuery<IUser>,
  options: mongoose.QueryOptions = {}
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      update,
      options
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findAndUpdateUserWithId(): ${error}`);
  }
};

// =============================================
// Additional User Service Functions
// =============================================

/**
 * Delete a user by ID
 */
export const deleteUserById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndDelete(_id)) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deleteUserById(): ${error}`);
  }
};

/**
 * Find multiple users with optional filters
 */
export const findUsers = async (
  filter: any = {},
  options: mongoose.QueryOptions = {}
): Promise<IUserDocument[]> => {
  try {
    return (await User.find(filter, null, options)) as IUserDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUsers(): ${error}`);
  }
};

/**
 * Update specific fields of a user (with new=true by default to return updated doc)
 */
export const updateUserFields = async (
  _id: mongoose.Types.ObjectId | string,
  fields: Partial<IUser>
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      { $set: fields },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateUserFields(): ${error}`);
  }
};

/**
 * Add a video to user's watch history
 */
export const addToWatchHistory = async (
  _id: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<IUserDocument | null> => {
  try {
    // First remove any existing entry for this video to avoid duplicates
    await User.findByIdAndUpdate(_id, {
      $pull: {
        watchHistory: { videoId },
      },
    });

    // Then add the new entry at the top (push it)
    return (await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          watchHistory: {
            videoId,
            watchedAt: new Date(),
          },
        },
      },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in addToWatchHistory(): ${error}`);
  }
};

/**
 * Remove a specific video from user's watch history
 */
export const removeFromWatchHistory = async (
  _id: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      {
        $pull: {
          watchHistory: { videoId },
        },
      },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in removeFromWatchHistory(): ${error}`);
  }
};

/**
 * Clear all watch history for a user
 */
export const clearUserWatchHistory = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      { $set: { watchHistory: [] } },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in clearWatchHistory(): ${error}`);
  }
};

/**
 * Update user's refresh token
 */
export const updateUserRefreshToken = async (
  _id: mongoose.Types.ObjectId | string,
  refreshToken: string
) => {
  try {
    await User.findByIdAndUpdate(
      _id,
      { $set: { refreshToken } },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateRefreshToken(): ${error}`);
  }
};

/**
 * Clear user's refresh token (logout)
 */
export const clearUserRefreshToken = async (
  _id: mongoose.Types.ObjectId | string
) => {
  try {
    await User.findByIdAndUpdate(
      _id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  } catch (error) {
    throw new ApiError(500, `❌ Error in clearRefreshToken(): ${error}`);
  }
};

/**
 * Update user password (Note: pre-save hook will hash the password)
 */
export const updateUserPassword = async (
  _id: mongoose.Types.ObjectId | string,
  newPassword: string
) => {
  try {
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, `❌ Error in updatePassword(): ${error}`);
  }
};

/**
 * Update user avatar
 */
export const updateUserAvatar = async (
  _id: mongoose.Types.ObjectId | string,
  avatar: string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      { $set: { avatar } },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateAvatar(): ${error}`);
  }
};

/**
 * Update user cover image
 */
export const updateUserCoverImage = async (
  _id: mongoose.Types.ObjectId | string,
  coverImage: string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findByIdAndUpdate(
      _id,
      { $set: { coverImage } },
      { new: true }
    )) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updateCoverImage(): ${error}`);
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (
  email: string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findOne({ email })) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUserByEmail(): ${error}`);
  }
};

/**
 * Find user by userName
 */
export const findUserByUserName = async (
  userName: string
): Promise<IUserDocument | null> => {
  try {
    return (await User.findOne({
      userName: userName.toLowerCase(),
    })) as IUserDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findUserByUserName(): ${error}`);
  }
};

/**
 * Check if a user exists with the given credentials
 */
export const userExists = async (
  _id: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const user = await User.exists({ _id });
    return user !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in userExists(): ${error}`);
  }
};

/**
 * Get user's watch history with video and owner details
 */
export const getUserWatchHistory = async (
  userId: mongoose.Types.ObjectId | string
): Promise<any[]> => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$watchHistory",
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory.videoId",
          foreignField: "_id",
          as: "userHistory",
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
                      fullName: 1,
                      userName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          userHistory: {
            $first: "$userHistory",
          },
        },
      },
      {
        $addFields: {
          "userHistory.watchedAt": "$watchHistory.watchedAt",
        },
      },
      {
        $sort: {
          "watchHistory.watchedAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          userHistory: {
            $push: "$userHistory",
          },
        },
      },
    ]);

    return user.length > 0 ? user[0].userHistory : [];
  } catch (error) {
    throw new ApiError(500, `❌ Error in getUserWatchHistory(): ${error}`);
  }
};

/**
 * Get user's liked videos with details
 */
export const getUserLikedVideos = async (
  userId: mongoose.Types.ObjectId | string
): Promise<any[]> => {
  try {
    const info = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "likedBy",
          as: "allLikedVideos",
          pipeline: [
            {
              $match: {
                video: {
                  $exists: true,
                },
              },
            },
            {
              $project: {
                video: 1,
              },
            },
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video_details",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      thumbnail: 1,
                      title: 1,
                      duration: 1,
                      views: 1,
                      createdAt: 1,
                      owner: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "owner",
                      foreignField: "_id",
                      as: "owner_details",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            userName: 1,
                            avatar: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      owner_details: {
                        $first: "$owner_details",
                      },
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                video_details: {
                  $first: "$video_details",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          avatar: 1,
          coverImage: 1,
          fullName: 1,
          allLikedVideos: 1,
        },
      },
    ]);

    return info;
  } catch (error) {
    throw new ApiError(500, `❌ Error in getUserLikedVideos(): ${error}`);
  }
};

/**
 * Count total users (with optional filter)
 */
export const countUsers = async (filter: any = {}): Promise<number> => {
  try {
    return await User.countDocuments(filter);
  } catch (error) {
    throw new ApiError(500, `❌ Error in countUsers(): ${error}`);
  }
};

/**
 * Find all users with non-null refresh tokens
 */
export const findUsersWithRefreshTokens = async (): Promise<
  IUserDocument[]
> => {
  try {
    return (await User.find({
      refreshToken: { $ne: null, $exists: true },
    })) as IUserDocument[];
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in findUsersWithRefreshTokens(): ${error}`
    );
  }
};

/**
 * Clear expired refresh tokens for all users
 * Returns count of cleared tokens
 */
export const clearExpiredRefreshTokens = async (
  verifyToken: (token: string) => boolean
): Promise<{ expiredCount: number; validCount: number }> => {
  try {
    const usersWithTokens = await findUsersWithRefreshTokens();
    let expiredCount = 0;
    let validCount = 0;

    for (const user of usersWithTokens) {
      if (!user.refreshToken) continue;

      const isValid = verifyToken(user.refreshToken);

      if (!isValid) {
        // Token is expired or invalid - remove it
        await clearUserRefreshToken(user._id);
        expiredCount++;
      } else {
        // Token is still valid
        validCount++;
      }
    }

    return { expiredCount, validCount };
  } catch (error) {
    throw new ApiError(
      500,
      `❌ Error in clearExpiredRefreshTokens(): ${error}`
    );
  }
};
