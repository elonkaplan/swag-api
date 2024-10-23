import { Context } from "hono";
import { Env } from "hono";
import type { JwtVariables } from "hono/jwt";

interface JwtPayload {
  id: string;
  username: string;
}

type Variables = JwtVariables<JwtPayload>;

interface Bindings {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

export interface AppEnv extends Env {
  Bindings: Bindings;
  Variables: Variables;
}

export type AppContext = Context<AppEnv>;
