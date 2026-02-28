import { z } from "zod";

export const playlistNameSchema = z
  .string()
  .min(3, { message: "title should be atleast 3 characters long" })
  .max(100, { message: "title should not be more than 100" });

export const playlistDescriptionSchema = z
  .string()
  .min(10, { message: "description should be atleast 10 characters long" })
  .max(500, { message: "description should not be more than 500" });

export const createPlaylistSchema = z.object({
  name: playlistNameSchema,
  description: playlistDescriptionSchema,
});

export const updatePlaylistSchema = z
  .object({
    name: playlistNameSchema.optional(),
    description: playlistDescriptionSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field must be provided",
  });
