import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }).min(2).trim(),
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email format" }).toLowerCase().trim(),
    password: z.string({ message: "Password is required" }).min(6, "Password must be at least 6 characters"),
    bio: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email format" }).toLowerCase().trim(),
    password: z.string({ message: "Password is required" }).min(1, "Password is required"),
  }),
});
