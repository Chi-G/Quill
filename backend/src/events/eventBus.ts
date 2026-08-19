import { EventEmitter } from "events";

export enum QuillEvent {
  POST_PUBLISHED = "post.published",
  POST_UPDATED = "post.updated",
  POST_ARCHIVED = "post.archived",
  COMMENT_CREATED = "comment.created",
  USER_REGISTERED = "user.registered",
}

class QuillEventBus extends EventEmitter {}

export const eventBus = new QuillEventBus();
