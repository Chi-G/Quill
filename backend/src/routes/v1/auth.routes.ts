import { Router } from "express";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAllDevices,
} from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../../validators/auth.validator.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.post("/logout-all", verifyJWT, logoutAllDevices);

export default router;
