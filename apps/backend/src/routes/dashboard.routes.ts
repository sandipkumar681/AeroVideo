import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.use(verifyJWT);

router.route("/stats").get(getChannelStats);

router.route("/videos").get(getChannelVideos);

export default router;
