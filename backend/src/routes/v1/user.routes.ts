import { Router } from "express";
import {
  getMe,
  updateMe,
  getUserById,
  updateUserRole,
} from "../../controllers/user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateProfileSchema, updateRoleSchema } from "../../validators/user.validator.js";
import { UserRole } from "../../constants/roles.js";

const router = Router();

router.get("/me", verifyJWT, getMe);
router.patch("/me", verifyJWT, validate(updateProfileSchema), updateMe);
router.get("/:id", getUserById);
router.patch(
  "/:id/role",
  verifyJWT,
  authorizeRoles(UserRole.ADMIN),
  validate(updateRoleSchema),
  updateUserRole
);

export default router;
