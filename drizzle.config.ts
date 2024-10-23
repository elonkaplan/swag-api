import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".dev.vars" });

console.log(process.env.DATABASE_URL);

export default {
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./migrations",
  dbCredentials: {
    url: `${process.env.DATABASE_URL}`,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
} satisfies Config;
