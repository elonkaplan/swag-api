import { friends, users } from "./db/schema";

export const userFormatter = (user: typeof users.$inferInsert) => ({
  id: user.id,
  username: user.username,
  createdAt: user.createdAt,
});

export const friendFormatter = (friend: typeof friends.$inferInsert) => ({
  id: friend.id,
  name: friend.name,
  email: friend.email,
  phone: friend.phone,
  createdAt: friend.createdAt,
});
