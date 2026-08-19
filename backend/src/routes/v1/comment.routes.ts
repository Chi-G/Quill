import { Router } from "express";
import {
  addComment,
  getPostComments,
  updateComment,
  deleteComment,
} from "../../controllers/comment.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createCommentSchema, updateCommentSchema } from "../../validators/comment.validator.js";

const router = Router();

router.post("/posts/:id/comments", verifyJWT, validate(createCommentSchema), addComment);
router.get("/posts/:id/comments", getPostComments);
router.patch("/comments/:id", verifyJWT, validate(updateCommentSchema), updateComment);
router.delete("/comments/:id", verifyJWT, deleteComment);

export default router;
