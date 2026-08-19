import { Response } from "express";
import { Webhook } from "../models/webhook.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";

export const createWebhook = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { url, event, secret } = req.body;
  const hmacSecret = secret || crypto.randomBytes(32).toString("hex");

  const webhook = await Webhook.create({
    owner: req.user!._id,
    url,
    event,
    secret: hmacSecret,
  });

  return res.status(201).json(new ApiResponse(201, webhook, "Webhook created successfully"));
});

export const getWebhooks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const webhooks = await Webhook.find({ owner: req.user!._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, webhooks, "Webhooks fetched successfully"));
});

export const deleteWebhook = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const webhook = await Webhook.findById(req.params.id);
  if (!webhook) throw new ApiError(404, "Webhook not found");

  if (webhook.owner.toString() !== (req.user!._id as any).toString()) {
    throw new ApiError(403, "Unauthorized access to webhook");
  }

  await Webhook.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "Webhook deleted successfully"));
});
