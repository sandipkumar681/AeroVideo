import mongoose, { model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ICommentDocument, ICommentModel } from "@aerovideo/types";

// -----------------------------
// 1. Schema
// -----------------------------
const commentSchema = new mongoose.Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Add compound unique index to prevent multiple comments from same user on same video
commentSchema.index({ video: 1, user: 1 }, { unique: true });

// -----------------------------
// 2. Plugins
// -----------------------------
commentSchema.plugin(mongooseAggregatePaginate);

// -----------------------------
// 3. Export
// -----------------------------
export const Comment = model<ICommentDocument, ICommentModel>(
  "Comment",
  commentSchema
);
