import jwt from "jsonwebtoken";
import { ENV_VALUE } from "../utils/env";
import {
  findUsersWithRefreshTokens,
  clearExpiredRefreshTokens,
} from "../services/user.services";
import { cronLogger } from "../utils/logger";

/**
 * Clean up expired refresh tokens from the database
 * This function:
 * 1. Uses user service to find all users with refresh tokens
 * 2. Verifies each token using a helper function
 * 3. Uses user service to clear expired tokens
 * 4. Logs cleanup statistics
 */
export const cleanupExpiredRefreshTokens = async (): Promise<void> => {
  try {
    cronLogger.info("Starting refresh token cleanup...");

    // Get count of users with refresh tokens
    const usersWithTokens = await findUsersWithRefreshTokens();
    cronLogger.info(
      `Found ${usersWithTokens.length} users with refresh tokens`
    );

    // Token verification helper
    const verifyToken = (token: string): boolean => {
      try {
        jwt.verify(token, ENV_VALUE.JWT.REFRESH_TOKEN_SECRET as jwt.Secret);
        return true; // Token is valid
      } catch (error) {
        return false; // Token is expired or invalid
      }
    };

    // Use service to clear expired tokens
    const { expiredCount, validCount } = await clearExpiredRefreshTokens(
      verifyToken
    );

    cronLogger.info(
      `Token cleanup completed: ${expiredCount} expired tokens removed, ${validCount} valid tokens retained`
    );
  } catch (error) {
    cronLogger.error("Error during token cleanup:", error);
  }
};
