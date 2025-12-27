import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  createNewPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylistController,
  removeVideoFromPlaylistController,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createNewPlaylist).get(getUserPlaylists);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/:playlistId/video").post(addVideoToPlaylistController);

router
  .route("/:playlistId/video/:videoId")
  .delete(removeVideoFromPlaylistController);

export default router;
