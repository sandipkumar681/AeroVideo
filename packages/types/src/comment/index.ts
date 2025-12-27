import mongoose, { HydratedDocument, Model } from "mongoose";

export interface IComment {
  content: string;
  video: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Instance Methods (if needed in the future)
export interface ICommentMethods {}

export type ICommentDocument = HydratedDocument<IComment, ICommentMethods>;
export interface ICommentModel extends Model<IComment, {}, ICommentMethods> {}
