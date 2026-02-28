import { z } from "zod";

export const videoTitleSchema = z
  .string()
  .min(3, { message: "title should be atleast 3 characters long" })
  .max(100, { message: "title should not be more than 100" });

export const videoDescriptionSchema = z
  .string()
  .min(10, { message: "description should be atleast 10 characters long" })
  .max(1000, { message: "description should not be more than 1000" });

export const uploadVideoSchema = z.object({
  title: videoTitleSchema,
  description: videoDescriptionSchema,
  isPublished: z.union([z.boolean(), z.enum(["true", "false"])]).default(true),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
});

export const updateVideoSchema = z.object({
  title: videoTitleSchema.optional(),
  description: videoDescriptionSchema.optional(),
  isPublished: z.boolean().optional(),
  tag: z.array(z.string()).optional(),
});

export const searchVideoSchema = z.object({
  query: z
    .string()
    .min(1, { message: "query should be atleast 1 characters long" }),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const commentContentSchema = z
  .string()
  .min(1, { message: "comment should be atleast 1 characters long" })
  .max(500, { message: "comment should not be more than 500" });

export const addCommentSchema = z.object({
  content: commentContentSchema,
});

export const updateCommentSchema = z.object({
  content: commentContentSchema,
});
