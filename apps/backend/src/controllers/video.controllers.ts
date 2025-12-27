import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { removeFile } from "../utils/removeFile";
import { AuthenticatedRequest } from "../types/other.types";
import {
  UploadVideoBody,
  UpdateVideoBody,
  SearchVideoQuery,
  PaginationQuery,
} from "@servicely/types";
import {
  uploadVideoSchema,
  updateVideoSchema,
  searchVideoSchema,
  paginationSchema,
} from "@servicely/schemas";
import {
  createVideo,
  findVideoById,
  findVideos,
  deleteVideoById,
  updatePublishStatus,
  updateVideoFields,
  incrementViews,
  findPublishedVideos,
  findVideosByOwner,
  getVideosWithSignedUrls,
} from "../services/video.services";
import {
  uploadImage,
  deleteImage,
  uploadVideo as uploadVideoService,
  deleteVideo,
  getSignedUrl,
} from "../services/upload.services";
import mongoose from "mongoose";
import { Request, Response } from "express";
import {
  deleteAllVideoLikes,
  countVideoLikes,
  hasUserLikedVideo,
} from "../services/like.services";
import { deleteAllVideoComments } from "../services/comment.services";
import {
  countChannelSubscribers,
  isUserSubscribed,
} from "../services/subscription.services";
import { sanitizeVideo } from "../helpers/sanitezResponse.helpers";
import { addToWatchHistory } from "../services/user.services";
import { getVideoDuration } from "../utils/getVideoDuration";

const uploadVideo = AsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, isPublished, tag }: UploadVideoBody = req.body;

    // Validate request body
    const { error } = uploadVideoSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    const files = req.files as {
      videoFile?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    };

    const videoLocalPath: string | null = files?.videoFile?.[0]?.path || null;
    const thumbnailLocalPath: string | null =
      files?.thumbnail?.[0]?.path || null;

    const cleanupFiles = (): void => {
      if (videoLocalPath) removeFile(videoLocalPath);
      if (thumbnailLocalPath) removeFile(thumbnailLocalPath);
    };

    if (!videoLocalPath) {
      if (thumbnailLocalPath) removeFile(thumbnailLocalPath);
      throw new ApiError(400, "Video file is required!");
    }

    if (!thumbnailLocalPath) {
      if (videoLocalPath) removeFile(videoLocalPath);
      throw new ApiError(400, "Thumbnail file is required!");
    }

    // Process tags if provided
    let processedTags: string[] = [];

    if (typeof tag === "string") {
      tag.trim();
      processedTags = tag.split(",").map((t: string) => t.trim().toLowerCase());
    }
    const duration: number = await getVideoDuration(videoLocalPath);

    // Upload video and thumbnail
    const { video: videoFile } = await uploadVideoService(
      videoLocalPath,
      "videos"
    );
    if (!videoFile) {
      cleanupFiles();
      throw new ApiError(500, "Failed to upload video file!");
    }

    const { image: thumbnail } = await uploadImage(
      thumbnailLocalPath,
      "thumbnails"
    );
    if (!thumbnail) {
      if (videoFile.fileName) {
        await deleteVideo(videoFile.fileName);
      }
      cleanupFiles();
      throw new ApiError(500, "Failed to upload thumbnail!");
    }

    // Clean up local files after successful upload
    cleanupFiles();

    await createVideo({
      title: title.trim(),
      description: description.trim(),
      videoFile: videoFile.fileName,
      thumbnail: thumbnail.fileName,
      duration,
      owner: req.user._id,
      isPublished: isPublished === "true" ? true : false,
      tag: processedTags,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Video uploaded successfully!"));
  }
);

const getVideoById = AsyncHandler(
  async (req: AuthenticatedRequest | Request, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(400, "Video ID is required!");
    }

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID!");
    }

    const video = await findVideoById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found!");
    }

    // Access control: if video is not published, only owner can see it
    const isOwner =
      "user" in req &&
      req.user &&
      video.owner.toString() === req.user._id.toString();

    if (!video.isPublished && !isOwner) {
      throw new ApiError(404, "Video not found!");
    }

    // Populate owner information
    await video.populate({
      path: "owner",
      select: "userName fullName avatar",
    });

    await incrementViews(videoId);

    // Generate signed URLs
    const videoObj = sanitizeVideo(video, isOwner as any);
    if (videoObj.videoFile) {
      videoObj.videoFile = await getSignedUrl(videoObj.videoFile);
    }
    if (videoObj.thumbnail) {
      videoObj.thumbnail = await getSignedUrl(videoObj.thumbnail);
    }
    // Generate signed URL for owner avatar if exists
    if (
      videoObj.owner &&
      typeof videoObj.owner === "object" &&
      "avatar" in videoObj.owner &&
      videoObj.owner.avatar
    ) {
      videoObj.owner.avatar = await getSignedUrl(videoObj.owner.avatar);
    }

    // Add subscription status and subscriber count
    const channelId = (video.owner as any)._id || video.owner;
    videoObj.subscriberCount = await countChannelSubscribers(channelId);
    videoObj.likesCount = await countVideoLikes(videoId);

    if ("user" in req && req.user) {
      videoObj.isSubscribed = await isUserSubscribed(req.user._id, channelId);
      videoObj.isLiked = await hasUserLikedVideo(req.user._id, videoId);

      // Add to watch history
      await addToWatchHistory(req.user._id, videoId);
    } else {
      videoObj.isSubscribed = false;
      videoObj.isLiked = false;
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videoObj, "Video fetched successfully!"));
  }
);

const getAllVideosForUser = AsyncHandler(
  async (req: AuthenticatedRequest | Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(400, "User ID is required!");
    }

    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID!");
    }

    const isOwner =
      "user" in req && req.user && req.user._id.toString() === userId;

    const filter: Record<string, any> = { owner: userId };
    if (!isOwner) {
      filter.isPublished = true;
    }

    const videos = await findVideosByOwner(userId, {
      filter,
      sort: { createdAt: -1 },
    });

    const videosWithSignedUrls = await getVideosWithSignedUrls(
      videos,
      isOwner as boolean
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          videosWithSignedUrls,
          `Found ${videosWithSignedUrls.length} video(s) for this user`
        )
      );
  }
);

const removeVideo = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const video = await findVideoById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  // Check if user owns the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video!");
  }

  // Store file URLs before deletion
  const videoFileUrl = video.videoFile;
  const thumbnailUrl = video.thumbnail;

  // --- BOTOM-UP CASCADE DELETION ---
  try {
    // 1. Delete all comments on the video
    await deleteAllVideoComments(videoId);

    // 2. Delete all likes on the video itself
    await deleteAllVideoLikes(videoId);

    // 3. Delete the video document from database
    await deleteVideoById(videoId);
  } catch (error) {
    console.error("Critical error during video cleanup cascade:", error);
    throw new ApiError(500, "Failed to clean up video data!");
  }

  // Final step: Delete files from storage
  // These are handled individually to ensure cleanup even if one fails
  try {
    if (videoFileUrl) await deleteVideo(videoFileUrl);
  } catch (err) {
    console.error(`Failed to delete video file ${videoFileUrl}:`, err);
  }

  try {
    if (thumbnailUrl) await deleteImage(thumbnailUrl);
  } catch (err) {
    console.error(`Failed to delete thumbnail file ${thumbnailUrl}:`, err);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully!"));
});

const toggleVideoPublishStatus = AsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(400, "Video ID is required!");
    }

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID!");
    }

    const video = await findVideoById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found!");
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to modify this video!");
    }

    const updatedVideo = await updatePublishStatus(videoId, !video.isPublished);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedVideo,
          `Video ${
            updatedVideo?.isPublished ? "published" : "unpublished"
          } successfully!`
        )
      );
  }
);

const getPublishedVideos = AsyncHandler(async (req: Request, res: Response) => {
  const { page, limit }: PaginationQuery = req.query;

  // Validate query parameters
  const { error, value } = paginationSchema.validate(req.query);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const validatedPage: number = value.page || 1;
  const validatedLimit: number = value.limit || 10;

  const options: mongoose.QueryOptions = {
    sort: { createdAt: -1 },
    skip: (validatedPage - 1) * validatedLimit,
    limit: validatedLimit,
  };

  const videos = await findPublishedVideos(options);

  // Populate owner information for each video
  await Promise.all(
    videos.map((video) =>
      video.populate({
        path: "owner",
        select: "userName fullName avatar",
      })
    )
  );

  // Generate signed URLs for videoFile and thumbnail using service utility
  const videosWithSignedUrls = await getVideosWithSignedUrls(videos);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: videosWithSignedUrls,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total: videosWithSignedUrls.length,
        },
      },
      `Found ${videosWithSignedUrls.length} published video(s)`
    )
  );
});

const searchVideos = AsyncHandler(async (req: Request, res: Response) => {
  const { query, page, limit }: SearchVideoQuery = req.query as any;

  // Validate query parameters
  const { error, value } = searchVideoSchema.validate(req.query);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const validatedQuery: string = value.query;
  const validatedPage: number = value.page || 1;
  const validatedLimit: number = value.limit || 10;

  const searchFilter: Record<string, any> = {
    isPublished: true,
    $or: [
      { title: { $regex: validatedQuery, $options: "i" } },
      { description: { $regex: validatedQuery, $options: "i" } },
      { tag: { $elemMatch: { $regex: validatedQuery, $options: "i" } } },
    ],
  };

  const options: mongoose.QueryOptions = {
    sort: { createdAt: -1 },
    skip: (validatedPage - 1) * validatedLimit,
    limit: validatedLimit,
  };

  const videos = await findVideos(searchFilter, options);

  if (videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No videos found matching your search"));
  }

  // Populate owner information for each video
  await Promise.all(
    videos.map((video) =>
      video.populate({
        path: "owner",
        select: "userName fullName avatar",
      })
    )
  );

  const videosWithSignedUrls = await getVideosWithSignedUrls(videos);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videosWithSignedUrls,
        `Found ${videosWithSignedUrls.length} video(s)`
      )
    );
});

const getRelatedVideos = AsyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const video = await findVideoById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  // Find related videos based on tags
  const relatedVideosFilter: Record<string, any> = {
    _id: { $ne: videoId }, // Exclude current video
    isPublished: true,
  };

  // If video has tags, find videos with similar tags
  if (video.tag && video.tag.length > 0) {
    relatedVideosFilter.tag = { $in: video.tag };
  }

  const options: mongoose.QueryOptions = {
    sort: { createdAt: -1 },
    limit: 10, // Limit to 10 related videos
  };

  let relatedVideos = await findVideos(relatedVideosFilter, options);

  // If no related videos found by tags, get random published videos
  if (relatedVideos.length === 0) {
    relatedVideos = await findPublishedVideos({
      ...options,
      skip: Math.floor(Math.random() * 10), // Random offset
    });
  }

  // Populate owner information for each video
  await Promise.all(
    relatedVideos.map((video) =>
      video.populate({
        path: "owner",
        select: "userName fullName avatar",
      })
    )
  );

  // Generate signed URLs for related videos using service utility
  const relatedVideosWithSignedUrls = await getVideosWithSignedUrls(
    relatedVideos
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        relatedVideosWithSignedUrls,
        `Found ${relatedVideosWithSignedUrls.length} related video(s)`
      )
    );
});

const updateVideo = AsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.params;
    const { title, description, isPublished, tag }: UpdateVideoBody = req.body;

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Valid video ID is required!");
    }

    // Validate request body
    const { error } = updateVideoSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    const video = await findVideoById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found!");
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this video!");
    }

    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (typeof isPublished === "boolean") updateData.isPublished = isPublished;
    if (tag) updateData.tag = tag;

    const updatedVideo = await updateVideoFields(videoId, updateData);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Video updated successfully!"));
  }
);

export {
  uploadVideo,
  updateVideo,
  getVideoById,
  getAllVideosForUser,
  removeVideo,
  toggleVideoPublishStatus,
  getPublishedVideos,
  searchVideos,
  getRelatedVideos,
};
