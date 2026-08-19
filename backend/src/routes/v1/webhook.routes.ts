import { Router } from "express";
import { createWebhook, getWebhooks, deleteWebhook } from "../../controllers/webhook.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { UserRole } from "../../constants/roles.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createWebhookSchema } from "../../validators/webhook.validator.js";

const router = Router();

router.use(verifyJWT, authorizeRoles(UserRole.ADMIN));
router.post("/webhooks", validate(createWebhookSchema), createWebhook);
router.get("/webhooks", getWebhooks);
router.delete("/webhooks/:id", deleteWebhook);

export default router;
