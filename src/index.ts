import { AppEnv } from "./types";
import { Hono } from "hono";
import { auth } from "./modules/auth/auth.controller";
import { cors } from "hono/cors";
import { user } from "./modules/user/user.controller";

const app = new Hono<AppEnv>();

app.use(cors());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/auth", auth);
app.route("/users", user);

export default app;
