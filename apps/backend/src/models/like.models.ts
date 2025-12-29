import mongoose, { model } from "mongoose";
import { ILikeDocument, ILikeModel } from "@aerovideo/types";

// -----------------------------
// 1. Schema
// -----------------------------
const likeSchema = new mongoose.Schema<ILikeDocument>(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
likeSchema.index({ video: 1, likedBy: 1 });

// -----------------------------
// 2. Export
// -----------------------------
export const Like = model<ILikeDocument, ILikeModel>("Like", likeSchema);
