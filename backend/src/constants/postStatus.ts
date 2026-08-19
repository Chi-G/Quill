export enum PostStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  REJECTED = "REJECTED",
}

export const POST_STATUSES = Object.values(PostStatus);
