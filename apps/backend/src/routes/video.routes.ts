import { Router } from "express";
import {
  uploadVideo,
  getVideoById,
  getAllVideosForUser,
  removeVideo,
  updateVideo,
  toggleVideoPublishStatus,
  getPublishedVideos,
  searchVideos,
  getRelatedVideos,
} from "../controllers/video.controllers";
import { verifyJWT, verifyOptionalJWT } from "../middlewares/auth.middlewares";
import { multerUpload } from "../middlewares/multer.middlewares";

const router = Router();

router.route("/upload-video").post(
  verifyJWT,
  multerUpload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router.route("/published").get(getPublishedVideos);

router.route("/search").get(searchVideos);

router.route("/user/:userId").get(verifyOptionalJWT, getAllVideosForUser);

router
  .route("/:videoId")
  .get(verifyOptionalJWT, getVideoById)
  .delete(verifyJWT, removeVideo)
  .patch(verifyJWT, updateVideo);

router.route("/:videoId/related").get(getRelatedVideos);

router
  .route("/:videoId/toggle-publish")
  .patch(verifyJWT, toggleVideoPublishStatus);

export default router;
