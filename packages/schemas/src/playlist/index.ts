import Joi from "joi";

export const createPlaylistSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
});

export const updatePlaylistSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
}).min(1); // At least one field must be provided
