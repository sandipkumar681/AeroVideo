import { ApiError } from "../utils/apiError";
import { Playlist } from "../models/playlist.models";
import { IPlaylist, IPlaylistDocument } from "@aerovideo/types";
import mongoose from "mongoose";

// =============================================
// Basic CRUD Functions
// =============================================

/**
 * Create a new playlist
 */
export const createPlaylist = async (
  data: Pick<IPlaylist, "name" | "description" | "owner"> &
    Partial<Pick<IPlaylist, "videos">>
): Promise<IPlaylistDocument> => {
  try {
    return (await Playlist.create(data)) as IPlaylistDocument;
  } catch (error) {
    throw new ApiError(500, `❌ Error in createPlaylist(): ${error}`);
  }
};

/**
 * Find a playlist by ID
 */
export const findPlaylistById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findById(_id)) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in findPlaylistById(): ${error}`);
  }
};

/**
 * Find multiple playlists with optional filters
 */
export const findPlaylists = async (
  filter: any = {},
  options: mongoose.QueryOptions = {}
): Promise<IPlaylistDocument[]> => {
  try {
    return (await Playlist.find(filter, null, options)) as IPlaylistDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findPlaylists(): ${error}`);
  }
};

/**
 * Update a playlist by ID
 */
export const updatePlaylistById = async (
  _id: mongoose.Types.ObjectId | string,
  update: mongoose.UpdateQuery<IPlaylist>,
  options: mongoose.QueryOptions = {}
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndUpdate(
      _id,
      update,
      options
    )) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updatePlaylistById(): ${error}`);
  }
};

/**
 * Delete a playlist by ID
 */
export const deletePlaylistById = async (
  _id: mongoose.Types.ObjectId | string
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndDelete(_id)) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in deletePlaylistById(): ${error}`);
  }
};

// =============================================
// Playlist-Specific Functions
// =============================================

/**
 * Find playlists by owner (user)
 */
export const findPlaylistsByOwner = async (
  ownerId: mongoose.Types.ObjectId | string,
  options: mongoose.QueryOptions = {}
): Promise<IPlaylistDocument[]> => {
  try {
    return (await Playlist.find({ owner: ownerId }, null, {
      sort: { createdAt: -1 },
      ...options,
    })) as IPlaylistDocument[];
  } catch (error) {
    throw new ApiError(500, `❌ Error in findPlaylistsByOwner(): ${error}`);
  }
};

/**
 * Add video to playlist
 */
export const addVideoToPlaylist = async (
  playlistId: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: videoId } },
      { new: true }
    )) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in addVideoToPlaylist(): ${error}`);
  }
};

/**
 * Add multiple videos to playlist
 */
export const addVideosToPlaylist = async (
  playlistId: mongoose.Types.ObjectId | string,
  videoIds: (mongoose.Types.ObjectId | string)[]
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: { $each: videoIds } } },
      { new: true }
    )) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in addVideosToPlaylist(): ${error}`);
  }
};

/**
 * Remove video from playlist
 */
export const removeVideoFromPlaylist = async (
  playlistId: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    )) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in removeVideoFromPlaylist(): ${error}`);
  }
};

/**
 * Update playlist details (name and/or description)
 */
export const updatePlaylistDetails = async (
  _id: mongoose.Types.ObjectId | string,
  details: Partial<Pick<IPlaylist, "name" | "description">>
): Promise<IPlaylistDocument | null> => {
  try {
    return (await Playlist.findByIdAndUpdate(
      _id,
      { $set: details },
      { new: true }
    )) as IPlaylistDocument | null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in updatePlaylistDetails(): ${error}`);
  }
};

/**
 * Check if playlist exists
 */
export const playlistExists = async (
  _id: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const playlist = await Playlist.exists({ _id });
    return playlist !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in playlistExists(): ${error}`);
  }
};

/**
 * Count playlists by owner
 */
export const countUserPlaylists = async (
  ownerId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    return await Playlist.countDocuments({ owner: ownerId });
  } catch (error) {
    throw new ApiError(500, `❌ Error in countUserPlaylists(): ${error}`);
  }
};

/**
 * Check if video is in playlist
 */
export const isVideoInPlaylist = async (
  playlistId: mongoose.Types.ObjectId | string,
  videoId: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  try {
    const playlist = await Playlist.findOne({
      _id: playlistId,
      videos: videoId,
    });
    return playlist !== null;
  } catch (error) {
    throw new ApiError(500, `❌ Error in isVideoInPlaylist(): ${error}`);
  }
};

/**
 * Get playlist video count
 */
export const getPlaylistVideoCount = async (
  playlistId: mongoose.Types.ObjectId | string
): Promise<number> => {
  try {
    const playlist = await Playlist.findById(playlistId);
    return playlist?.videos?.length || 0;
  } catch (error) {
    throw new ApiError(500, `❌ Error in getPlaylistVideoCount(): ${error}`);
  }
};
