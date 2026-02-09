import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types/other.types";
import {
  toggleVideoLike,
  findUserLikedVideos,
} from "../services/like.services";
import { findVideoById } from "../services/video.services";
import { getSignedUrl } from "../services/upload.services";
import mongoose from "mongoose";

const toggleVideoLikeController = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { videoId } = req.params as { videoId: string };

    if (!videoId) {
      throw new ApiError(400, "Video ID is required!");
    }

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID!");
    }

    // Check if video exists
    const video = await findVideoById(videoId);
    if (!video) {
      throw new ApiError(404, "Video does not exist!");
    }

    const result = await toggleVideoLike(req.user._id, videoId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Video ${result.liked ? "liked" : "unliked"} successfully!`,
        ),
      );
  },
);

const getLikedVideosController = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const likedVids = await findUserLikedVideos(req.user._id);

    // Generate signed URLs for video thumbnails and owner avatars
    const likedVideosWithSignedUrls = await Promise.all(
      likedVids.map(async (like) => {
        if (like.video.thumbnail) {
          like.video.thumbnail = await getSignedUrl(like.video.thumbnail);
        }
        if (like.video.owner?.avatar) {
          like.video.owner.avatar = await getSignedUrl(like.video.owner.avatar);
        }
        return like;
      }),
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          likedVideosWithSignedUrls,
          "Liked videos fetched successfully!",
        ),
      );
  },
);

export { toggleVideoLikeController, getLikedVideosController };
