import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { translateRoute } from "./routes/translate.ts";
import { explainRoute } from "./routes/explain.ts";
import { vocabularyRoute } from "./routes/vocabulary.ts";
import { userRoute } from "./routes/user.ts";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "chrome-extension://*"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api", translateRoute);
app.route("/api", explainRoute);
app.route("/api", vocabularyRoute);
app.route("/api", userRoute);

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Not found" } }, 404));

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: err.message } },
    500
  );
});

const port = parseInt(process.env.PORT || "3002", 10);

console.log(`API server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
