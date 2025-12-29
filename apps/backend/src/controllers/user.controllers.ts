import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import {
  changeAccountDetailsBody,
  changeCurrentPasswordBody,
  LoginBody,
  RegisterBody,
  resetPasswordBody,
} from "@aerovideo/types";
import { removeFile } from "../utils/removeFile";
import {
  changeAccountDetailsSchema,
  changeCurrentPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@aerovideo/schemas";
import { verifyOtp } from "../services/otp.services";
import {
  authFindUser,
  createUser,
  findAndUpdateUserWithId,
  findUserWithId,
  updateUserRefreshToken,
  clearUserRefreshToken,
  updateUserPassword,
  updateUserAvatar,
  updateUserCoverImage,
  findUserByEmail,
  findUserByUserName,
} from "../services/user.services";
import {
  uploadImage,
  deleteImage,
  getSignedUrl,
} from "../services/upload.services";
import { generateAccessAndRefreshToken } from "../services/generateAccessAndRefreshToken.services";
import {
  getAccessTokenOptions,
  getClearCookieOptions,
  getRefreshTokenOptions,
} from "../utils/tokenOptions";
import { AuthenticatedRequest, DecodedToken } from "../types/other.types";
import { ENV_VALUE } from "../utils/env";
import { sanitizeUser } from "../helpers/sanitezResponse.helpers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  getUserWatchHistory,
  getUserLikedVideos,
} from "../services/user.services";

const registerUser = AsyncHandler(async (req, res) => {
  const { fullName, userName, email, password, otp }: RegisterBody = req.body;

  const files = req.files as {
    avatar?: Express.Multer.File[];
    coverImage?: Express.Multer.File[];
  };

  const avatarLocalPath = files?.avatar?.[0]?.path || null;
  const coverImageLocalPath = files?.coverImage?.[0]?.path || null;

  if (!avatarLocalPath) {
    if (coverImageLocalPath) removeFile(coverImageLocalPath);
    throw new ApiError(400, "Avatar file is required!");
  }

  const cleanupFiles = () => {
    removeFile(avatarLocalPath);
    if (coverImageLocalPath) removeFile(coverImageLocalPath);
  };

  const { error } = registerSchema.validate(req.body);

  if (error) {
    cleanupFiles();
    throw new ApiError(400, error.details[0].message);
  }

  if (!(await verifyOtp(email, otp))) {
    cleanupFiles();
    throw new ApiError(400, "OTP is incorrect or does not exists!");
  }

  const existedUser = await authFindUser({ userName, email });

  if (existedUser) {
    cleanupFiles();
    throw new ApiError(
      400,
      "Email or Username is already taken. Please choose another one."
    );
  }

  const { image: avatar } = await uploadImage(avatarLocalPath, "avatars");

  let coverImageFileName = "";
  if (coverImageLocalPath) {
    const { image: uploadedCoverImage } = await uploadImage(
      coverImageLocalPath,
      "coverImages"
    );
    coverImageFileName = uploadedCoverImage?.fileName || "";
  }

  cleanupFiles();

  await createUser({
    fullName,
    userName,
    email,
    password,
    avatar: avatar!.fileName,
    coverImage: coverImageFileName,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "User registered successfully!"));
});

const loginUser = AsyncHandler(async (req, res) => {
  const { email, password }: LoginBody = req.body;

  const { error } = loginSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "User doesn't exist. Please signup!");
  }

  if (!(await user.isPasswordCorrect(password))) {
    throw new ApiError(400, "Password is incorrect!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  if (!refreshToken) {
    throw new ApiError(500, "Failed to generate refresh token!");
  }

  await updateUserRefreshToken(user._id, refreshToken);

  const accessTokenOptions = getAccessTokenOptions();
  const refreshTokenOptions = getRefreshTokenOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        { user: sanitizeUser(user), refreshToken, accessToken },
        "User log in is successful!"
      )
    );
});

const logoutUser = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  await clearUserRefreshToken(req.user._id);

  const clearCookieOption = getClearCookieOptions();
  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOption)
    .clearCookie("refreshToken", clearCookieOption)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken: string | undefined =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Invalid refreshtoken!");
  }

  let decodedToken: DecodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      ENV_VALUE.JWT.REFRESH_TOKEN_SECRET
    ) as DecodedToken; //
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token!");
  }

  if (!decodedToken || !decodedToken._id) {
    throw new ApiError(401, "Unauthorised request!");
  }

  const user = await findUserWithId(decodedToken._id);
  if (!user) {
    throw new ApiError(400, "User does not exists!");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token is expired or invalid!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  if (!refreshToken) {
    throw new ApiError(500, "Failed to generate refresh token!");
  }

  await updateUserRefreshToken(user._id, refreshToken);

  const accessTokenOptions = getAccessTokenOptions();
  const refreshTokenOptions = getRefreshTokenOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access and Refresh token updated successfully"
      )
    );
});

const changePassword = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const { oldPassword, newPassword }: changeCurrentPasswordBody = req.body;

  const { error } = changeCurrentPasswordSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "Old and New Password can not be same!");
  }

  const user = await findUserWithId(req.user._id);
  if (!user) {
    throw new ApiError(400, "User doesnot exists!");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Old password is incorrect!");
  }

  await updateUserPassword(user._id, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUserDetails = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new ApiError(401, "User not found in request. Please login!");
  }

  const user = sanitizeUser(req.user);

  if (user.avatar) {
    user.avatar = await getSignedUrl(user.avatar);
  }

  if (user.coverImage) {
    user.coverImage = await getSignedUrl(user.coverImage);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details fetched successfully!"));
});

const changeAccountDetails = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { userName, fullName }: changeAccountDetailsBody = req.body;

    const { error } = changeAccountDetailsSchema.validate(req.body);

    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    const user = await findUserWithId(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    if (userName && userName !== user.userName) {
      const isUserNameTaken = await findUserByUserName(userName);
      if (isUserNameTaken) {
        throw new ApiError(400, "Username already taken!");
      }
    }

    await findAndUpdateUserWithId(
      req.user._id,
      { $set: { userName, fullName } },
      { new: true } as mongoose.QueryOptions
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Details updated successfully"));
  }
);

const updateAvatar = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Must require an avatar file!");
  }

  const { image: avatar } = await uploadImage(avatarLocalPath, "avatars");

  const user = await findUserWithId(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  await deleteImage(user.avatar);

  await updateUserAvatar(user._id, avatar.fileName);

  removeFile(avatarLocalPath);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Avatar updated successfully!"));
});

const updateCoverImage = AsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
      throw new ApiError(400, "Must require a cover image file!");
    }

    const { image: coverImage } = await uploadImage(
      coverImageLocalPath,
      "coverImages"
    );

    const user = await findUserWithId(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    if (user.coverImage) {
      await deleteImage(user.coverImage);
    }

    await updateUserCoverImage(user._id, coverImage.fileName);

    removeFile(coverImageLocalPath);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Cover image updated successfully!"));
  }
);

const getWatchHistory = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const rawHistory = await getUserWatchHistory(req.user._id);

  if (rawHistory.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No watch history found"));
  }

  // Sign URLs for each video in history
  const history = await Promise.all(
    rawHistory.map(async (video: any) => {
      if (video.thumbnail) {
        video.thumbnail = await getSignedUrl(video.thumbnail);
      }
      if (video.owner?.avatar) {
        video.owner.avatar = await getSignedUrl(video.owner.avatar);
      }
      return video;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Watch history fetched successfully!"));
});

const getLikedVideos = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  const likedVideos = await getUserLikedVideos(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully!")
    );
});

const doesUserExists = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Must Provide an email!");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "Email does not exist! Please signup");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email exists! Sending OTP..."));
});

const resetPassword = AsyncHandler(async (req, res) => {
  const { email, otp, newPassword }: resetPasswordBody = req.body;

  const { error } = resetPasswordSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  if (!(await verifyOtp(email, otp))) {
    throw new ApiError(400, "OTP is incorrect or has expired!");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  await updateUserPassword(user._id, newPassword);
  await clearUserRefreshToken(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully!"));
});

const isUserLoggedIn = AsyncHandler(async (req: AuthenticatedRequest, res) => {
  return res.status(200).json(new ApiResponse(200, {}, "User is logged in!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getUserDetails,
  changeAccountDetails,
  updateAvatar,
  updateCoverImage,
  getWatchHistory,
  getLikedVideos,
  doesUserExists,
  resetPassword,
  isUserLoggedIn,
};
