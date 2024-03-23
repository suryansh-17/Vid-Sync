import { Router } from "express";

import {
  addComment,
  deleteComment,
  updateComment,
  getVideoComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComment).post(addComment);

router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
