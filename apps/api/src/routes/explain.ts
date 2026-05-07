import { Hono } from "hono";
import { z } from "zod";
import { AIOrchestrator } from "../orchestrator/index.ts";

const explainRoute = new Hono();
const orchestrator = new AIOrchestrator();

const ExplainRequestSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional(),
  targetLanguage: z.string(),
  userLevel: z.string().optional(),
});

explainRoute.post("/explain", async (c) => {
  try {
    const body = await c.req.json();
    const validated = ExplainRequestSchema.parse(body);

    const result = await orchestrator.explain(validated.text, {
      context: validated.context,
      targetLanguage: validated.targetLanguage,
      userLevel: validated.userLevel,
    });

    return c.json({
      meaning: result.meaning,
      grammar: result.grammar,
      keywords: result.keywords,
      simplifiedEnglish: result.simplifiedEnglish,
    });
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

export { explainRoute };
