import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types/other.types";
import { createPlaylistSchema, updatePlaylistSchema } from "@aerovideo/schemas";
import {
  createPlaylist,
  findPlaylistById,
  findPlaylistsByOwner,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylistById,
  updatePlaylistDetails,
} from "../services/playlist.services";
import { findVideoById } from "../services/video.services";
import { getSignedUrl } from "../services/upload.services";
import mongoose from "mongoose";

const createNewPlaylist = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { name, description } = req.body;

    // Validate request body
    const { error } = createPlaylistSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    const playlist = await createPlaylist({
      name: name.trim(),
      description: description.trim(),
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, playlist, "Playlist created successfully!"));
  },
);

const getUserPlaylists = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const playlists = await findPlaylistsByOwner(req.user._id, {
      sort: { createdAt: -1 },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists fetched successfully!"));
  },
);

const getPlaylistById = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { playlistId } = req.params as { playlistId: string };

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  const playlist = await findPlaylistById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist does not exist!");
  }

  // Check if user owns the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to access this playlist!");
  }

  // Populate videos and their owners
  await playlist.populate({
    path: "videos",
    select:
      "title description thumbnail videoFile duration views createdAt owner",
    populate: {
      path: "owner",
      select: "userName fullName avatar",
    },
  });

  // Generate signed URLs for all videos in the playlist
  const playlistObj = playlist.toObject();
  if (playlistObj.videos && Array.isArray(playlistObj.videos)) {
    playlistObj.videos = await Promise.all(
      playlistObj.videos.map(async (v: any) => {
        if (v.videoFile) v.videoFile = await getSignedUrl(v.videoFile);
        if (v.thumbnail) v.thumbnail = await getSignedUrl(v.thumbnail);
        if (v.owner && v.owner.avatar)
          v.owner.avatar = await getSignedUrl(v.owner.avatar);
        return v;
      }),
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlistObj, "Playlist fetched successfully!"));
});

const addVideoToPlaylistController = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { playlistId, videoId } = req.body;

    if (!playlistId || !videoId) {
      throw new ApiError(400, "Playlist ID and Video ID are required!");
    }

    if (
      !mongoose.isValidObjectId(playlistId) ||
      !mongoose.isValidObjectId(videoId)
    ) {
      throw new ApiError(400, "Invalid playlist ID or video ID!");
    }

    const playlist = await findPlaylistById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist does not exist!");
    }

    // Check if user owns the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to modify this playlist!",
      );
    }

    // Check if video exists
    const video = await findVideoById(videoId);
    if (!video) {
      throw new ApiError(404, "Video does not exist!");
    }

    const updatedPlaylist = await addVideoToPlaylist(playlistId, videoId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video added to playlist successfully!",
        ),
      );
  },
);

const removeVideoFromPlaylistController = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { playlistId, videoId } = req.params as {
      playlistId: string;
      videoId: string;
    };

    if (!playlistId || !videoId) {
      throw new ApiError(400, "Playlist ID and Video ID are required!");
    }

    if (
      !mongoose.isValidObjectId(playlistId) ||
      !mongoose.isValidObjectId(videoId)
    ) {
      throw new ApiError(400, "Invalid playlist ID or video ID!");
    }

    const playlist = await findPlaylistById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist does not exist!");
    }

    // Check if user owns the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to modify this playlist!",
      );
    }

    const updatedPlaylist = await removeVideoFromPlaylist(playlistId, videoId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video removed from playlist successfully!",
        ),
      );
  },
);

const deletePlaylist = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { playlistId } = req.params as { playlistId: string };

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  const playlist = await findPlaylistById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist does not exist!");
  }

  // Check if user owns the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist!");
  }

  await deletePlaylistById(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully!"));
});

const updatePlaylist = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, description } = req.body as {
    name: string;
    description: string;
  };
  const { playlistId } = req.params as { playlistId: string };

  // Validate request body
  const { error } = updatePlaylistSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  const playlist = await findPlaylistById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist does not exist!");
  }

  // Check if user owns the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this playlist!");
  }

  const updatedPlaylist = await updatePlaylistDetails(playlistId, {
    ...(name && { name: name.trim() }),
    ...(description && { description: description.trim() }),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully!"),
    );
});

export {
  createNewPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylistController,
  removeVideoFromPlaylistController,
  deletePlaylist,
  updatePlaylist,
};
