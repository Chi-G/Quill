import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";

    if (error instanceof ZodError) {
      statusCode = 400;
      message = "Validation Error";
      const issueMessages = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      error = new ApiError(statusCode, message, issueMessages, error.stack);
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid resource identifier: ${error.value}`;
      error = new ApiError(statusCode, message, [], error.stack);
    } else if (error.code === 11000) {
      statusCode = 400;
      const keys = Object.keys(error.keyValue || {}).join(", ");
      message = `Duplicate field value entered for ${keys}`;
      error = new ApiError(statusCode, message, [], error.stack);
    } else {
      error = new ApiError(
        statusCode,
        message,
        error?.errors || [],
        error.stack
      );
    }
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    success: false,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
