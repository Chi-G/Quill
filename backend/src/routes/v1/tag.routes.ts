import { Router } from "express";
import { getTags, createTag, getCategories, createCategory } from "../../controllers/tag.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { UserRole } from "../../constants/roles.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createTagSchema, createCategorySchema } from "../../validators/tag.validator.js";

export const tagRouter = Router();
tagRouter.get("/tags", getTags);
tagRouter.post(
  "/tags",
  verifyJWT,
  authorizeRoles(UserRole.EDITOR, UserRole.ADMIN),
  validate(createTagSchema),
  createTag
);

export const categoryRouter = Router();
categoryRouter.get("/categories", getCategories);
categoryRouter.post(
  "/categories",
  verifyJWT,
  authorizeRoles(UserRole.EDITOR, UserRole.ADMIN),
  validate(createCategorySchema),
  createCategory
);
