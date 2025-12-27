import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  addComment,
  editComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controllers";

const router = Router();

router.route("/add/:videoId").post(verifyJWT, addComment);

router.route("/edit/:commentId").patch(verifyJWT, editComment);

router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

router.route("/all/:videoId").get(getAllComments);

export default router;
