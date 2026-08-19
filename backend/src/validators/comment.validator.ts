import { z } from "zod";

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string({ message: "Post ID parameter is required" }),
  }),
  body: z.object({
    content: z.string({ message: "Comment content is required" }).min(1).max(1000).trim(),
    parentComment: z.string().optional(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string({ message: "Comment ID parameter is required" }),
  }),
  body: z.object({
    content: z.string({ message: "Comment content is required" }).min(1).max(1000).trim(),
  }),
});
