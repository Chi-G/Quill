import { Request, Response } from "express";
import { Tag } from "../models/tag.model.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import slugify from "slugify";

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await Tag.find().sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, tags, "Tags fetched successfully"));
});

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const tag = await Tag.create({ name, slug });
  return res.status(201).json(new ApiResponse(201, tag, "Tag created successfully"));
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const category = await Category.create({ name, slug, description: description || "" });
  return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});
