import { IUserDocument } from "@aerovideo/types";
import { ApiError } from "../utils/apiError";

export const generateAccessAndRefreshToken = async (
  user: IUserDocument
): Promise<{
  accessToken: string;
  refreshToken: string | undefined;
}> => {
  try {
    user.refreshToken = user.generateRefreshToken();

    await user.save({ validateBeforeSave: false });

    return {
      accessToken: user.generateAccessToken(),
      refreshToken: user.refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      `Error while generating access and refresh token! ${error}`
    );
  }
};
