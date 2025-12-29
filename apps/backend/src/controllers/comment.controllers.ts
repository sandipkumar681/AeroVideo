import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types/other.types";
import { addCommentSchema, updateCommentSchema } from "@aerovideo/schemas";
import {
  createComment,
  findCommentById,
  findCommentsByVideo,
  updateCommentContent,
  deleteCommentById,
  findUserCommentOnVideo,
  findCommentsByVideoWithUser,
} from "../services/comment.services";
import { findVideoById } from "../services/video.services";
import { getSignedUrl } from "../services/upload.services";
import mongoose from "mongoose";
import { sanitizeComment } from "../helpers/sanitezResponse.helpers";
import { ICommentDocument } from "@aerovideo/types";

const addComment = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  // Validate request body
  const { error } = addCommentSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

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

  // Check if user has already commented on this video
  const existingComment = await findUserCommentOnVideo(videoId, req.user._id);

  if (existingComment) {
    throw new ApiError(400, "You have already commented on this video!");
  }

  const newComment = await createComment({
    content: content.trim(),
    video: videoId as any,
    user: req.user._id,
  });

  // Populate user info before returning
  await newComment.populate({
    path: "user",
    select: "userName fullName avatar",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        sanitizeComment(newComment),
        "Comment added successfully!"
      )
    );
});

const editComment = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate request body
  const { error } = updateCommentSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required!");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID!");
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment does not exist!");
  }

  // Check if user owns the comment
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment!");
  }

  const updatedComment = await updateCommentContent(commentId, content);

  if (!updatedComment) {
    throw new ApiError(500, "Failed to update comment!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizeComment(updatedComment),
        "Comment updated successfully!"
      )
    );
});

const deleteComment = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required!");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID!");
  }

  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment does not exist!");
  }

  // Check if user owns the comment
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment!");
  }

  await deleteCommentById(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully!"));
});

const getAllComments = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const comments = await findCommentsByVideoWithUser(videoId, {
    sort: { createdAt: -1 },
  });

  // Generate signed URLs for user avatars
  const sanitizedComments = await Promise.all(
    comments.map(async (comment: any) => {
      if (comment.user?.avatar) {
        comment.user.avatar = await getSignedUrl(comment.user.avatar);
      }
      return sanitizeComment(comment);
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizedComments,
        "All comments fetched successfully!"
      )
    );
});

export { addComment, editComment, deleteComment, getAllComments };
