import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  submitForReview,
  approvePost,
  rejectPost,
  updatePost,
  deletePost,
} from "../../controllers/post.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { checkOwnership } from "../../middlewares/checkOwnership.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
  rejectPostSchema,
  getPostsQuerySchema,
} from "../../validators/post.validator.js";
import { UserRole } from "../../constants/roles.js";
import { Post } from "../../models/post.model.js";

const router = Router();

router.get("/", validate(getPostsQuerySchema), getPosts);
router.get("/:slug", getPostBySlug);

router.post(
  "/",
  verifyJWT,
  authorizeRoles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN),
  validate(createPostSchema),
  createPost
);

router.patch(
  "/:id/submit-review",
  verifyJWT,
  authorizeRoles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN),
  submitForReview
);

router.patch(
  "/:id/approve",
  verifyJWT,
  authorizeRoles(UserRole.EDITOR, UserRole.ADMIN),
  approvePost
);

router.patch(
  "/:id/reject",
  verifyJWT,
  authorizeRoles(UserRole.EDITOR, UserRole.ADMIN),
  validate(rejectPostSchema),
  rejectPost
);

router.patch(
  "/:id",
  verifyJWT,
  checkOwnership(Post),
  validate(updatePostSchema),
  updatePost
);

router.delete(
  "/:id",
  verifyJWT,
  checkOwnership(Post),
  deletePost
);

export default router;
