import { Response, NextFunction } from "express";
import { Model, Document } from "mongoose";
import { UserRole } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { AuthenticatedRequest } from "./auth.middleware.js";

export const checkOwnership = (
  model: Model<any>,
  authorField = "author"
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      const resourceId = req.params.id;
      const resource: Document | null = await model.findById(resourceId);

      if (!resource) {
        return next(new ApiError(404, "Resource not found"));
      }

      const authorId = (resource as any)[authorField]?.toString();
      const userId = (req.user._id as any).toString();

      // Allow owner or Editor/Admin role bypass
      const isOwner = authorId === userId;
      const isPrivileged = [UserRole.EDITOR, UserRole.ADMIN].includes(req.user.role);

      if (!isOwner && !isPrivileged) {
        return next(
          new ApiError(403, "Forbidden: You are not authorized to modify this resource")
        );
      }

      (req as any).resource = resource;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
