import { Router } from "express";
import { toggleReaction, getPostReactions } from "../../controllers/reaction.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/posts/:id/reactions", verifyJWT, toggleReaction);
router.get("/posts/:id/reactions", getPostReactions);

export default router;
