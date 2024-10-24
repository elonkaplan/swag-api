import { JwtType, jwtMiddleware } from "../../middlewares/jwtMiddleware";
import { compare, hash } from "bcrypt-ts";

import { AppEnv } from "../../types";
import { Hono } from "hono";
import { authSchema } from "./auth.schema";
import { constants } from "../../constants";
import { eq } from "drizzle-orm";
import { getDb } from "../../helpers";
import { sign } from "hono/jwt";
import { userFormatter } from "../../formatters";
import { users } from "../../db/schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const auth = new Hono<AppEnv>();

auth.use("/session", jwtMiddleware(JwtType.ACCESS));
auth.use("/refresh", jwtMiddleware(JwtType.REFRESH));

auth.post("/login", zValidator("json", authSchema), async (c) => {
  const db = getDb(c);

  const body: z.infer<typeof authSchema> = await c.req.json();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, body.username))
    .limit(1);

  if (!user || !(await compare(body.password, user.password))) {
    return c.json(
      { status: "error", message: "Invalid username or password" },
      401
    );
  }

  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.accessTokenExpiresIn,
    },
    c.env.JWT_SECRET
  );

  const refreshToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.refreshTokenExpiresIn,
    },
    c.env.JWT_REFRESH_SECRET
  );

  return c.json({
    status: "ok",
    user: userFormatter(user),
    accessToken,
    refreshToken,
  });
});

auth.post("/register", zValidator("json", authSchema), async (c) => {
  const db = getDb(c);

  const body: z.infer<typeof authSchema> = await c.req.json();

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

  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.accessTokenExpiresIn,
    },
    c.env.JWT_SECRET
  );

  const refreshToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.refreshTokenExpiresIn,
    },
    c.env.JWT_REFRESH_SECRET
  );

  return c.json({
    status: "ok",
    user: userFormatter(user),
    accessToken,
    refreshToken,
  });
});

auth.get("/session", async (c) => {
  const db = getDb(c);

  const jwtPayload = c.get("jwtPayload");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, jwtPayload.id))
    .limit(1);

  if (!user) {
    return c.json({ status: "error", message: "Unauthorized" }, 401);
  }

  return c.json({ status: "ok", user: userFormatter(user) });
});

auth.post("/refresh", async (c) => {
  const db = getDb(c);

  const jwtPayload = c.get("jwtPayload");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, jwtPayload.id))
    .limit(1);

  if (!user) {
    return c.json({ status: "error", message: "Unauthorized" }, 401);
  }

  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.accessTokenExpiresIn,
    },
    c.env.JWT_SECRET
  );

  const refreshToken = await sign(
    {
      id: user.id,
      username: user.username,
      exp: new Date().getTime() / 1000 + constants.refreshTokenExpiresIn,
    },
    c.env.JWT_REFRESH_SECRET
  );

  return c.json({
    status: "ok",
    user: userFormatter(user),
    accessToken,
    refreshToken,
  });
});
