import { AppContext } from "./types";
import { drizzle } from "drizzle-orm/neon-http";

export const getDb = (c: AppContext) => {
  const db = drizzle(c.env.DATABASE_URL);

  return db;
};
