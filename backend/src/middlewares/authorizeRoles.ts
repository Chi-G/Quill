import { Response, NextFunction } from "express";
import { UserRole } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { AuthenticatedRequest } from "./auth.middleware.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    return next();
  };
};
