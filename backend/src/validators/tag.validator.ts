import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z.string({ message: "Tag name is required" }).min(2).max(30).trim(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ message: "Category name is required" }).min(2).max(50).trim(),
    description: z.string().optional(),
  }),
});
