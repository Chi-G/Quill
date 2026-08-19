import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import commentRoutes from "./comment.routes.js";
import reactionRoutes from "./reaction.routes.js";
import { tagRouter, categoryRouter } from "./tag.routes.js";
import mediaRoutes from "./media.routes.js";
import webhookRoutes from "./webhook.routes.js";

const v1Router = Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/posts", postRoutes);
v1Router.use("/", commentRoutes);
v1Router.use("/", reactionRoutes);
v1Router.use("/", tagRouter);
v1Router.use("/", categoryRouter);
v1Router.use("/", mediaRoutes);
v1Router.use("/", webhookRoutes);

export default v1Router;
