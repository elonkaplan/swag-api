import { AppEnv } from "./types";
import { Hono } from "hono";
import { auth } from "./modules/auth/auth.controller";
import { user } from "./modules/user/user.controller";

const app = new Hono<AppEnv>();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/auth", auth);
app.route("/users", user);

export default app;
