import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  ),
});
