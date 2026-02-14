import mongoose, { HydratedDocument, Model } from "mongoose";

export interface IVideo {
  _id: string | mongoose.Types.ObjectId;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner:
    | string
    | mongoose.Types.ObjectId
    | {
        _id: string;
        userName: string;
        fullName?: string;
        avatar?: string;
      };
  tag: string[];
  isSubscribed?: boolean;
  subscriberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Instance Methods (if needed in the future)
export interface IVideoMethods {}

export type IVideoDocument = HydratedDocument<IVideo, IVideoMethods>;
export interface IVideoModel extends Model<IVideo, {}, IVideoMethods> {}

// Request Body Types
export interface UploadVideoBody {
  title: string;
  description: string;
  isPublished?: string | boolean;
  tag?: string;
}

export interface UpdateVideoBody {
  title?: string;
  description?: string;
  isPublished?: boolean;
  tag?: string[];
}

export interface SearchVideoQuery {
  query: string;
  page?: number;
  limit?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
