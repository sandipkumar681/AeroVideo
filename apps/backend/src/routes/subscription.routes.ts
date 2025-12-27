import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  toggleUserSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers";

const router = Router();

router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

// Protected routes
router.route("/toggle/:channelId").post(verifyJWT, toggleUserSubscription);
router.route("/subscribed").get(verifyJWT, getSubscribedChannels);

export default router;
