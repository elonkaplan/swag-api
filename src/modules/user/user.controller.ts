import { JwtType, jwtMiddleware } from "../../middlewares/jwtMiddleware";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  createFriendSchema,
  createUserSchema,
  friendIdSchema,
  idSchema,
  paginationSchema,
} from "./user.schema";
import { friendFormatter, userFormatter } from "../../formatters";
import { friends, users } from "../../db/schema";

import { AppEnv } from "../../types";
import { Hono } from "hono";
import { getDb } from "../../helpers";
import { hash } from "bcrypt-ts";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const user = new Hono<AppEnv>();

user.use("/:id/friends/*", jwtMiddleware(JwtType.ACCESS));

user.post("/", zValidator("json", createUserSchema), async (c) => {
  const db = getDb(c);

  const body: z.infer<typeof createUserSchema> = await c.req.json();

  const hashedPassword = await hash(body.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      username: body.username,
      password: hashedPassword,
    })
    .onConflictDoNothing({
      target: users.username,
    })
    .returning();

  if (!user) {
    return c.json({ status: "error", message: "Username already exists" }, 409);
  }

  return c.json({ status: "ok", user: userFormatter(user) });
});

user.get("/", zValidator("query", paginationSchema), async (c) => {
  const db = getDb(c);

  const query: z.infer<typeof paginationSchema> = paginationSchema.parse(
    c.req.query()
  );

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = page === 1 ? 0 : (query.page - 1) * limit;
  const take = limit;
  const sort = query.sort || "desc";

  const sorter = sort === "asc" ? asc : desc;

  const usersList = await db
    .select({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sorter(users.createdAt))
    .limit(take)
    .offset(skip);

  const total = await db.$count(users);

  const pagination = {
    page,
    total,
  };

  return c.json({
    status: "ok",
    users: usersList,
    pagination,
  });
});

user.get("/stats", async (c) => {
  const db = getDb(c);

  const totalUsers = await db.$count(users);
  const totalFriends = await db.$count(friends);

  return c.json({
    status: "ok",
    stats: {
      totalUsers,
      totalFriends,
    },
  });
});

user.post(
  "/:id/friends",
  zValidator("param", idSchema),
  zValidator("json", createFriendSchema),
  async (c) => {
    const { id: userId } = idSchema.parse(c.req.param());

    const jwtPayload = c.get("jwtPayload");

    if (userId !== jwtPayload.id) {
      return c.json({ status: "error", message: "Unauthorized" }, 401);
    }

    const db = getDb(c);

    const body: z.infer<typeof createFriendSchema> = await c.req.json();

    const [friend] = await db
      .insert(friends)
      .values({
        userId,
        name: body.name,
        email: body.email,
        phone: body.phone,
      })
      .returning();

    return c.json({ status: "ok", friend: friendFormatter(friend) });
  }
);

user.delete(
  "/:id/friends/:friendId",
  zValidator("param", friendIdSchema),
  async (c) => {
    const { id: userId, friendId } = friendIdSchema.parse(c.req.param());

    const jwtPayload = c.get("jwtPayload");

    if (userId !== jwtPayload.id) {
      return c.json({ status: "error", message: "Unauthorized" }, 401);
    }

    const db = getDb(c);

    const [friend] = await db
      .delete(friends)
      .where(and(eq(friends.userId, userId), eq(friends.id, friendId)))
      .returning();

    return c.json({ status: "ok", friend: friendFormatter(friend) });
  }
);

user.get(
  "/:id/friends",
  zValidator("param", idSchema),
  zValidator("query", paginationSchema),
  async (c) => {
    const { id: userId } = idSchema.parse(c.req.param());

    const jwtPayload = c.get("jwtPayload");

    if (userId !== jwtPayload.id) {
      return c.json({ status: "error", message: "Unauthorized" }, 401);
    }

    const db = getDb(c);

    const query: z.infer<typeof paginationSchema> = paginationSchema.parse(
      c.req.query()
    );

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = page === 1 ? 0 : (query.page - 1) * limit;
    const take = limit;
    const sort = query.sort || "desc";

    const sorter = sort === "asc" ? asc : desc;

    const friendsList = await db
      .select()
      .from(friends)
      .where(eq(friends.userId, userId))
      .orderBy(sorter(friends.createdAt))
      .limit(take)
      .offset(skip);

    const total = await db.$count(friends, eq(friends.userId, userId));

    const pagination = {
      page,
      total,
    };

    return c.json({
      status: "ok",
      friends: friendsList.map(friendFormatter),
      pagination,
    });
  }
);
