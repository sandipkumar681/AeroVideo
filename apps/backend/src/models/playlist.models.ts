import mongoose, { model } from "mongoose";
import { IPlaylistDocument, IPlaylistModel } from "@aerovideo/types";

// -----------------------------
// 1. Schema
// -----------------------------
const playlistSchema = new mongoose.Schema<IPlaylistDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// -----------------------------
// 2. Export
// -----------------------------
export const Playlist = model<IPlaylistDocument, IPlaylistModel>(
  "Playlist",
  playlistSchema
);
