import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string({ message: "Title is required" }).min(3, "Title must be at least 3 characters").trim(),
    content: z.string({ message: "Content is required" }).min(10, "Content must be at least 10 characters"),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string({ message: "Post ID parameter is required" }),
  }),
  body: z.object({
    title: z.string().min(3).trim().optional(),
    content: z.string().min(10).optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const rejectPostSchema = z.object({
  params: z.object({
    id: z.string({ message: "Post ID parameter is required" }),
  }),
  body: z.object({
    reason: z.string({ message: "Rejection reason is required" }).min(5, "Reason must be at least 5 characters"),
  }),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    status: z.string().optional(),
    tag: z.string().optional(),
    category: z.string().optional(),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});
