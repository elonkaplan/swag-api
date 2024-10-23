import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

interface Bindings {}

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/docs",
  swaggerUI({
    url: "/public/swagger.json",
  })
);

app.get("/", (c) => {
  console.log(c);
  return c.text("Hello Hono!");
});

export default app;
