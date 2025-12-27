import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  toggleVideoLikeController,
  getLikedVideosController,
} from "../controllers/like.controllers";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").post(toggleVideoLikeController);
router.route("/liked-videos").get(getLikedVideosController);

export default router;
