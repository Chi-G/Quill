import { z } from "zod";

export const registerUserSchema = z.object({
  body: z.object({
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .trim(),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Invalid email format" })
      .toLowerCase()
      .trim(),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters"),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Invalid email format" })
      .toLowerCase()
      .trim(),
    password: z
      .string({ message: "Password is required" })
      .min(1, "Password is required"),
  }),
});
