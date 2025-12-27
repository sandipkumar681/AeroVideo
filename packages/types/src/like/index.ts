import mongoose, { HydratedDocument, Model } from "mongoose";

export interface ILike {
  video: mongoose.Types.ObjectId;
  likedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Instance Methods (if needed in the future)
export interface ILikeMethods {}

export type ILikeDocument = HydratedDocument<ILike, ILikeMethods>;
export interface ILikeModel extends Model<ILike, {}, ILikeMethods> {}
