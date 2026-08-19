import { z } from "zod";
import { UserRole } from "../constants/roles.js";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string({ message: "User ID parameter is required" }),
  }),
  body: z.object({
    role: z.enum(UserRole, { message: "Invalid user role" }),
  }),
});
