import { Hono } from "hono";
import { z } from "zod";

const vocabularyRoute = new Hono();

const VocabularyRequestSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  sourceSentence: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceTitle: z.string().optional(),
});

const vocabularyStore: Map<string, unknown[]> = new Map();

vocabularyRoute.post("/vocabulary", async (c) => {
  try {
    const body = await c.req.json();
    const validated = VocabularyRequestSchema.parse(body);

    const id = `voc_${Date.now()}`;

    const item = {
      id,
      word: validated.word,
      translation: validated.translation,
      status: "new",
    };

    return c.json(item);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        { error: { code: "INVALID_REQUEST", message: error.message } },
        400
      );
    }
    return c.json(
      { error: { code: "INTERNAL_ERROR", message: "Unknown error" } },
      500
    );
  }
});

vocabularyRoute.get("/vocabulary", async (c) => {
  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = parseInt(c.req.query("limit") || "20", 10);

  return c.json({
    items: [],
    total: 0,
    page,
    limit,
  });
});

vocabularyRoute.delete("/vocabulary/:id", async (c) => {
  const id = c.req.param("id");

  return c.json({ success: true });
});

export { vocabularyRoute };
