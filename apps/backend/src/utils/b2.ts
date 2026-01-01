import B2 from "backblaze-b2";
import fs from "fs";
import { ApiError } from "./apiError";
import { ENV_VALUE } from "./env";
// -----------------------------
// Types
// -----------------------------
export interface B2UploadResult {
  url: string;
  fileId: string;
  fileName: string;
  [key: string]: any;
}
// -----------------------------
// Initialization
// -----------------------------
const b2 = new B2({
  applicationKeyId: ENV_VALUE.B2.B2_APPLICATION_KEY_ID,
  applicationKey: ENV_VALUE.B2.B2_APPLICATION_KEY,
});
let isAuthorized = false;
let downloadUrl = "";
let lastAuthTime = 0;
const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const authorizeB2 = async (): Promise<string> => {
  const now = Date.now();
  const timeSinceLastAuth = now - lastAuthTime;

  // Force re-authorization if never authorized OR 6+ hours have passed
  if (!isAuthorized || timeSinceLastAuth >= SIX_HOURS_IN_MS) {
    try {
      const res = await b2.authorize();
      isAuthorized = true;
      downloadUrl = res.data.downloadUrl;
      lastAuthTime = now;
      return downloadUrl;
    } catch (error: any) {
      console.error("❌ B2 authorization error:", error);
      isAuthorized = false;
      throw new ApiError(500, "Failed to authorize with Backblaze B2.");
    }
  }
  return downloadUrl;
};
// -----------------------------
// Upload
// -----------------------------
export const uploadOnB2 = async (
  localFilePath: string,
  folder: string = "uploads"
): Promise<B2UploadResult | null> => {
  if (!localFilePath) return null;
  try {
    await authorizeB2();
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileName = `${folder}/${Date.now()}-${localFilePath
      .split("/")
      .pop()}`;
    const { data: uploadData } = await b2.getUploadUrl({
      bucketId: ENV_VALUE.B2.B2_BUCKET_ID,
    });
    const response = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName: fileName,
      data: fileBuffer,
    });
    const fileId = response.data.fileId;

    return {
      fileId,
      fileName,
      ...response.data,
    };
  } catch (error: any) {
    console.error("❌ B2 upload error:", error);
    throw new ApiError(
      500,
      "Error while uploading file to B2. Please try again later."
    );
  }
};
// -----------------------------
// Delete
// -----------------------------
export const deleteOnB2 = async (publicUrl: string): Promise<"ok" | null> => {
  if (!publicUrl) return null;
  try {
    await authorizeB2();
    let fileName_ = publicUrl;
    if (publicUrl.includes("://")) {
      const urlParts = publicUrl.split("/");
      const bucketNameIndex = urlParts.indexOf(ENV_VALUE.B2.B2_BUCKET_NAME);
      if (bucketNameIndex === -1) {
        throw new ApiError(400, "Invalid B2 URL: bucket name not found in URL");
      }
      fileName_ = urlParts
        .slice(bucketNameIndex + 1)
        .join("/")
        .split("?")[0];
    }
    const { data: listData } = await b2.listFileNames({
      bucketId: ENV_VALUE.B2.B2_BUCKET_ID,
      startFileName: fileName_,
      maxFileCount: 1,
      prefix: fileName_,
      delimiter: "/",
    } as any);
    const file = listData.files.find((f: any) => f.fileName === fileName_);
    if (!file) {
      console.warn(`⚠️ File not found on B2 for deletion: ${fileName_}`);
      return null;
    }
    await b2.deleteFileVersion({
      fileName: file.fileName,
      fileId: file.fileId,
    });
    return "ok";
  } catch (error: any) {
    console.error("❌ B2 delete error:", error);
    throw new ApiError(
      500,
      "Error while deleting file from B2. Please try again later."
    );
  }
};
// -----------------------------
// Signed URL
// -----------------------------
export const getSignedUrlB2 = async (
  fileName: string,
  durationInSeconds: number = 3600
): Promise<string> => {
  try {
    const downloadUrl = await authorizeB2();
    const { data: downloadAuth } = await b2.getDownloadAuthorization({
      bucketId: ENV_VALUE.B2.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: durationInSeconds,
    });
    return `${downloadUrl}/file/${ENV_VALUE.B2.B2_BUCKET_NAME}/${fileName}?Authorization=${downloadAuth.authorizationToken}`;
  } catch (error: any) {
    console.error("❌ B2 signed URL error:", error);
    throw new ApiError(500, "Failed to generate signed URL for B2 file.");
  }
};
