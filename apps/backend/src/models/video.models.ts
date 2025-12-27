import mongoose, { model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { IVideoDocument, IVideoModel } from "@servicely/types";

// -----------------------------
// 1. Schema
// -----------------------------
const videoSchema = new mongoose.Schema<IVideoDocument>(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tag: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

// -----------------------------
// 2. Plugins
// -----------------------------
videoSchema.plugin(mongooseAggregatePaginate);

// -----------------------------
// 3. Export
// -----------------------------
export const Video = model<IVideoDocument, IVideoModel>("Video", videoSchema);
