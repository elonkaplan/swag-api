import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(20),
});

export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .pipe(z.coerce.number().int().positive())
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .pipe(z.coerce.number().int().positive())
    .default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const createFriendSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
});

export const friendIdSchema = z.object({
  id: z.string().uuid(),
  friendId: z.string().uuid(),
});
