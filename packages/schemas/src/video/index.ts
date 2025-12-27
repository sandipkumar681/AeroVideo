import Joi from "joi";

export const uploadVideoSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  isPublished: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false"))
    .default(true),
  tag: Joi.alternatives()
    .try(
      Joi.string(), // comma-separated tags
      Joi.array().items(Joi.string())
    )
    .optional(),
});

export const updateVideoSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  isPublished: Joi.boolean().optional(),
  tag: Joi.array().items(Joi.string()).optional(),
});

export const searchVideoSchema = Joi.object({
  query: Joi.string().min(1).required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});
