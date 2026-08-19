import { z } from "zod";

export const createWebhookSchema = z.object({
  body: z.object({
    url: z.string({ message: "Webhook destination URL is required" }).url("Invalid URL format"),
    event: z.string({ message: "Event subscription name is required" }),
    secret: z.string().optional(),
  }),
});
