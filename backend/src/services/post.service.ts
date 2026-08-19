import mongoose from "mongoose";
import { Post, IPost } from "../models/post.model.js";
import { Tag } from "../models/tag.model.js";
import { Category } from "../models/category.model.js";
import { PostStatus } from "../constants/postStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { CacheService } from "./cache.service.js";
import { eventBus, QuillEvent } from "../events/eventBus.js";
import slugify from "slugify";

export class PostService {
  private static calculateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private static async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await Post.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }

  static async createPost(
    authorId: string,
    data: {
      title: string;
      content: string;
      excerpt?: string;
      tags?: string[];
      category?: string;
      coverImage?: string;
    }
  ) {
    const slug = await this.generateUniqueSlug(data.title);
    const readingTime = this.calculateReadingTime(data.content);

    // Resolve Category ObjectId (Find or Create by name/slug)
    let categoryId = null;
    if (data.category) {
      if (mongoose.Types.ObjectId.isValid(data.category)) {
        categoryId = data.category;
      } else {
        const catSlug = slugify(data.category, { lower: true, strict: true });
        let categoryDoc = await Category.findOne({ slug: catSlug });
        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: data.category, slug: catSlug });
        }
        categoryId = categoryDoc._id;
      }
    }

    // Resolve Tag ObjectIds (Find or Create by name/slug for each tag)
    const tagIds: mongoose.Types.ObjectId[] = [];
    if (data.tags && data.tags.length > 0) {
      for (const tagStr of data.tags) {
        if (mongoose.Types.ObjectId.isValid(tagStr)) {
          tagIds.push(new mongoose.Types.ObjectId(tagStr));
        } else {
          const tagSlug = slugify(tagStr, { lower: true, strict: true });
          let tagDoc = await Tag.findOne({ slug: tagSlug });
          if (!tagDoc) {
            tagDoc = await Tag.create({ name: tagStr, slug: tagSlug });
          }
          tagIds.push(tagDoc._id as mongoose.Types.ObjectId);
        }
      }
    }

    const post = await Post.create({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 160),
      author: authorId,
      status: PostStatus.DRAFT,
      tags: tagIds,
      category: categoryId,
      coverImage: (data.coverImage && mongoose.Types.ObjectId.isValid(data.coverImage)) ? data.coverImage : null,
      readingTime,
    });

    await CacheService.del("posts:*");
    return await post.populate([
      { path: "author", select: "name email avatar role" },
      { path: "category", select: "name slug" },
      { path: "tags", select: "name slug" },
    ]);
  }

  static async getPosts(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PostStatus;
    tag?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    userRole?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `posts:list:${JSON.stringify(query)}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const filter: any = {};

    // Non-privileged users only see PUBLISHED posts by default
    if (query.status) {
      filter.status = query.status;
    } else if (!query.userRole || query.userRole === "USER" || query.userRole === "AUTHOR") {
      filter.status = PostStatus.PUBLISHED;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const posts = await Post.find(filter)
      .populate("author", "name email avatar role")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(filter);

    const result = {
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    };

    await CacheService.set(cacheKey, result, 60);
    return result;
  }

  static async getPostBySlug(slug: string) {
    const cacheKey = `posts:slug:${slug}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const post = await Post.findOne({ slug })
      .populate("author", "name email avatar role bio")
      .populate("category", "name slug description")
      .populate("tags", "name slug");

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    // Increment view count asynchronously
    post.viewCount += 1;
    await post.save({ validateBeforeSave: false });

    await CacheService.set(cacheKey, post, 120);
    return post;
  }

  static async submitForReview(postId: string, authorId: string) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (post.author.toString() !== authorId) {
      throw new ApiError(403, "You can only submit your own posts for review");
    }

    if (post.status !== PostStatus.DRAFT && post.status !== PostStatus.REJECTED) {
      throw new ApiError(400, `Cannot submit post with status '${post.status}'`);
    }

    post.status = PostStatus.PENDING_REVIEW;
    await post.save();
    await CacheService.del("posts:*");

    eventBus.emit(QuillEvent.POST_UPDATED, post);
    return post;
  }

  static async approvePost(postId: string, editorId: string) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (post.status !== PostStatus.PENDING_REVIEW) {
      throw new ApiError(400, "Only posts pending review can be approved");
    }

    post.status = PostStatus.PUBLISHED;
    post.reviewedBy = editorId as any;
    post.publishedAt = new Date();
    await post.save();

    await CacheService.del("posts:*");
    eventBus.emit(QuillEvent.POST_PUBLISHED, post);
    return post;
  }

  static async rejectPost(postId: string, editorId: string, reason: string) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (post.status !== PostStatus.PENDING_REVIEW) {
      throw new ApiError(400, "Only posts pending review can be rejected");
    }

    post.status = PostStatus.REJECTED;
    post.reviewedBy = editorId as any;
    post.rejectionReason = reason;
    await post.save();

    await CacheService.del("posts:*");
    eventBus.emit(QuillEvent.POST_UPDATED, post);
    return post;
  }

  static async updatePost(
    postId: string,
    data: Partial<{ title: string; content: string; excerpt: string; tags: string[]; category: string; coverImage: string }>
  ) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (data.title && data.title !== post.title) {
      post.title = data.title;
      post.slug = await this.generateUniqueSlug(data.title);
    }

    if (data.content) {
      post.content = data.content;
      post.readingTime = this.calculateReadingTime(data.content);
    }

    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.category !== undefined) {
      if (!data.category) {
        post.category = undefined;
      } else if (mongoose.Types.ObjectId.isValid(data.category)) {
        post.category = data.category as any;
      } else {
        const catSlug = slugify(data.category, { lower: true, strict: true });
        let categoryDoc = await Category.findOne({ slug: catSlug });
        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: data.category, slug: catSlug });
        }
        post.category = categoryDoc._id as any;
      }
    }

    if (data.tags !== undefined) {
      const tagIds: mongoose.Types.ObjectId[] = [];
      for (const tagStr of data.tags) {
        if (mongoose.Types.ObjectId.isValid(tagStr)) {
          tagIds.push(new mongoose.Types.ObjectId(tagStr));
        } else {
          const tagSlug = slugify(tagStr, { lower: true, strict: true });
          let tagDoc = await Tag.findOne({ slug: tagSlug });
          if (!tagDoc) {
            tagDoc = await Tag.create({ name: tagStr, slug: tagSlug });
          }
          tagIds.push(tagDoc._id as mongoose.Types.ObjectId);
        }
      }
      post.tags = tagIds;
    }
    if (data.coverImage !== undefined) post.coverImage = (data.coverImage && mongoose.Types.ObjectId.isValid(data.coverImage)) ? data.coverImage as any : undefined;

    await post.save();
    await CacheService.del("posts:*");
    eventBus.emit(QuillEvent.POST_UPDATED, post);
    return post;
  }

  static async deletePost(postId: string) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    await Post.findByIdAndDelete(postId);
    await CacheService.del("posts:*");
    eventBus.emit(QuillEvent.POST_ARCHIVED, post);
  }
}
