import { Router } from "express";
import multer from "multer";
import { uploadMedia, deleteMedia } from "../../controllers/media.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.post("/media/upload", verifyJWT, upload.single("file"), uploadMedia);
router.delete("/media/:id", verifyJWT, deleteMedia);

export default router;
