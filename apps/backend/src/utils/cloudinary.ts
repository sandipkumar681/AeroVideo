import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import { removeFile } from "./removeFile";
import { ApiError } from "./apiError";
import { ENV_VALUE } from "./env";

// -----------------------------
// Types
// -----------------------------

export type UploadResult = UploadApiResponse | null;

// -----------------------------
// Environment validation
// -----------------------------

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: ENV_VALUE.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: ENV_VALUE.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: ENV_VALUE.CLOUDINARY.CLOUDINARY_API_SECRET,
  });
};

// -----------------------------
// Upload
// -----------------------------

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadResult> => {
  if (!localFilePath) return null;

  try {
    configureCloudinary();

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", error);
    throw new ApiError(
      500,
      "Error while uploading image. Please try again later."
    );
  } finally {
    try {
      if (localFilePath) removeFile(localFilePath);
    } catch (cleanupError) {
      console.error("Failed to remove local file:", cleanupError);
    }
  }
};

// -----------------------------
// Delete Resource (Shared Logic)
// -----------------------------

const deleteResource = async (
  publicUrl: string,
  resourceType: "image" | "video"
): Promise<null | "ok"> => {
  if (!publicUrl) return null;

  try {
    configureCloudinary();
    const publicId = extractPublicId(publicUrl);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return "ok";
  } catch (error) {
    console.error(`❌ Cloudinary delete ${resourceType} error:`, error);
    throw new ApiError(
      500,
      `Error while deleting ${resourceType}. Please try again later.`
    );
  }
};

// -----------------------------
// Delete Image
// -----------------------------

export const deleteOnCloudinaryImage = async (
  publicUrl: string
): Promise<null | "ok"> => {
  return deleteResource(publicUrl, "image");
};

// -----------------------------
// Delete Video
// -----------------------------

export const deleteOnCloudinaryVideo = async (
  publicUrl: string
): Promise<null | "ok"> => {
  return deleteResource(publicUrl, "video");
};
