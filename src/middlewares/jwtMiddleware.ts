import { AppContext } from "../types";
import { Next } from "hono";
import { jwt } from "hono/jwt";

export enum JwtType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export const jwtMiddleware = (type: JwtType) => (c: AppContext, next: Next) => {
  const jwtMiddleware = jwt({
    secret:
      type === JwtType.ACCESS ? c.env.JWT_SECRET : c.env.JWT_REFRESH_SECRET,
  });

  return jwtMiddleware(c, next);
};
