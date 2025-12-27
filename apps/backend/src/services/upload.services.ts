import { ApiError } from "../utils/apiError";
import {
  uploadOnB2,
  deleteOnB2,
  getSignedUrlB2,
  B2UploadResult,
} from "../utils/b2";
export interface UploadResult {
  url: string;
}

export interface UploadImageResult {
  image: B2UploadResult;
}
export interface UploadVideoResult {
  video: B2UploadResult;
}

export const uploadImage = async (
  imagePath: string,
  folderName: string = "images"
): Promise<UploadImageResult> => {
  try {
    const imageData = await uploadOnB2(imagePath, folderName);
    if (!imageData || !imageData.fileName) {
      throw new ApiError(500, "Failed to upload image!");
    }
    return { image: imageData };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `B2 upload failed! ${error}`);
  }
};

export const uploadVideo = async (
  videoPath: string,
  folderName: string = "videos"
): Promise<UploadVideoResult> => {
  try {
    const videoData = await uploadOnB2(videoPath, folderName);
    if (!videoData || !videoData.fileName) {
      throw new ApiError(500, "Failed to upload video!");
    }
    return { video: videoData };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `B2 upload failed! ${error}`);
  }
};

export const deleteImage = async (fileName: string) => {
  return await deleteOnB2(fileName);
};
export const deleteVideo = async (fileName: string) => {
  return await deleteOnB2(fileName);
};
export const getSignedUrl = async (fileName: string, duration?: number) => {
  return await getSignedUrlB2(fileName, duration);
};
