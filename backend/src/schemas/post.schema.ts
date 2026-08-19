import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .trim(),
    description: z
      .string({ message: "Description is required" })
      .min(5, "Description must be at least 5 characters")
      .trim(),
    age: z
      .number({ message: "Age is required" })
      .min(1, "Age must be at least 1")
      .max(150, "Age must be under 150")
      .optional()
      .default(18),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string({ message: "Post ID parameter is required" }),
  }),
  body: z
    .object({
      name: z.string().min(2).trim().optional(),
      description: z.string().min(5).trim().optional(),
      age: z.number().min(1).max(150).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});
