import { Response } from "express";
import { Media } from "../models/media.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadMedia = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const media = await Media.create({
    url: `/uploads/${req.file.filename || req.file.originalname}`,
    publicId: req.file.filename || req.file.originalname,
    type: req.file.mimetype.startsWith("image/") ? "image" : "document",
    uploadedBy: req.user!._id,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });

  return res.status(201).json(new ApiResponse(201, media, "File uploaded successfully"));
});

export const deleteMedia = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new ApiError(404, "Media not found");

  if (media.uploadedBy.toString() !== (req.user!._id as any).toString()) {
    throw new ApiError(403, "You can only delete your own uploaded media");
  }

  await Media.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "Media asset deleted successfully"));
});
