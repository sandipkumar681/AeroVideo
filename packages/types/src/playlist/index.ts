import mongoose, { HydratedDocument, Model } from "mongoose";

export interface IPlaylist {
  name: string;
  description: string;
  videos: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Instance Methods (if needed in the future)
export interface IPlaylistMethods {}

export type IPlaylistDocument = HydratedDocument<IPlaylist, IPlaylistMethods>;
export interface IPlaylistModel
  extends Model<IPlaylist, {}, IPlaylistMethods> {}
