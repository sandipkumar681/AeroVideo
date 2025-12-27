import { Router } from "express";
import {
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
} from "../controllers/user.controllers";
import { getPublicChannelProfile } from "../controllers/dashboard.controllers";
import { multerUpload } from "../middlewares/multer.middlewares";
import { verifyJWT, verifyOptionalJWT } from "../middlewares/auth.middlewares";

const router = Router();

// Public routes
router.route("/c/:userName").get(verifyOptionalJWT, getPublicChannelProfile);
router.route("/register").post(
  multerUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-tokens").get(refreshAccessToken);

router.route("/check-email").post(doesUserExists);

router.route("/reset-password").post(resetPassword);

// Secured routes
router.route("/logout").get(verifyJWT, logoutUser);

router.route("/change-password").patch(verifyJWT, changePassword);

router.route("/user-details").get(verifyJWT, getUserDetails);

router.route("/update-details").patch(verifyJWT, changeAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, multerUpload.single("avatar"), updateAvatar);

router
  .route("/update-coverImage")
  .patch(verifyJWT, multerUpload.single("coverImage"), updateCoverImage);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

router.route("/liked-videos").get(verifyJWT, getLikedVideos);

router.route("/auth/status").get(verifyJWT, isUserLoggedIn);

export default router;
