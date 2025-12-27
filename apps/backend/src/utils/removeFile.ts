import { unlinkSync } from "node:fs";
import { ApiError } from "./apiError";

export const removeFile = (pathToFile: string) => {
  try {
    if (pathToFile) {
      unlinkSync(pathToFile);
    }
  } catch (error) {
    throw new ApiError(500, `Error while removing file!${error}`);
  }
};
