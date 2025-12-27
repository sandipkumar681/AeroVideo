import { AsyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { DecodedToken } from "../types/other.types";
import { findUserWithId } from "../services/user.services";
import { ENV_VALUE } from "../utils/env";

export const verifyJWT = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(400, "Access token not found! Please login!");
  }

  const decodedToken = jwt.verify(
    token,
    ENV_VALUE.JWT.ACCESS_TOKEN_SECRET
  ) as DecodedToken;

  if (!decodedToken) {
    throw new ApiError(401, "Unauthorised request!");
  }

  const user = await findUserWithId(decodedToken._id);

  if (!user) {
    throw new ApiError(400, "User does not exists!");
  }

  req.user = user;

  next();
});

export const verifyOptionalJWT = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(
      token,
      ENV_VALUE.JWT.ACCESS_TOKEN_SECRET
    ) as DecodedToken;

    if (decodedToken) {
      const user = await findUserWithId(decodedToken._id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // If token is invalid, we just ignore it for "optional" auth
    console.error("Optional JWT verification failed:", error);
  }

  next();
});
