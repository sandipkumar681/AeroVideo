import {
  IUserDocument,
  IVideoDocument,
  ICommentDocument,
} from "@servicely/types";

export const sanitizeUser = (
  user: IUserDocument,
  shouldHaveCreatedAt: Boolean = false,
  shouldHavewatchHistory: Boolean = false
) => {
  // Convert Mongoose Document → Plain JavaScript object
  const obj = user.toObject() as Record<string, any>;

  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  delete obj.updatedAt;
  if (!shouldHaveCreatedAt) {
    delete obj.createdAt;
  }
  if (!shouldHavewatchHistory) {
    delete obj.watchHistory;
  }

  return obj;
};

export const sanitizeVideo = (
  video: IVideoDocument,
  shouldHaveIsPublished: Boolean = false
) => {
  const obj = video.toObject() as Record<string, any>;

  delete obj.__v;
  delete obj.updatedAt;
  if (!shouldHaveIsPublished) {
    delete obj.isPublished;
  }

  return obj;
};

export const sanitizeComment = (comment: ICommentDocument | any) => {
  const obj =
    typeof comment.toObject === "function"
      ? comment.toObject()
      : { ...comment };

  delete obj.__v;
  delete obj.updatedAt;

  return obj;
};
