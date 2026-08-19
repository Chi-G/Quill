import { Response } from "express";
import { ReactionService } from "../services/reaction.service.js";
import { ReactionType } from "../models/reaction.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const toggleReaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.body;
  const result = await ReactionService.toggleReaction(
    (req.user!._id as any).toString(),
    req.params.id as string,
    type as ReactionType
  );
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const getPostReactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await ReactionService.getPostReactions(req.params.id as string);
  return res.status(200).json(new ApiResponse(200, result, "Reaction counts fetched"));
});
