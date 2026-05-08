import { Hono } from "hono";
import { TranslateRequestSchema } from "./schemas.ts";
import { createPipeline } from "../pipeline/index.ts";
import { AIOrchestrator } from "../orchestrator/index.ts";
import { recordUsage } from "../services/index.ts";

const translateRoute = new Hono();

const pipeline = createPipeline();
const orchestrator = new AIOrchestrator();

translateRoute.post("/translate", async (c) => {
  try {
    const body = await c.req.json();
    const validated = TranslateRequestSchema.parse(body);

    // 从 Authorization header 提取 API Key
    const authHeader = c.req.header("Authorization") || "";
    const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    const pipelineContext = {
      sourceLanguage: validated.sourceLanguage,
      targetLanguage: validated.targetLanguage,
      url: validated.context?.url,
      title: validated.context?.title,
      domain: validated.context?.domain,
    };

    const results = await pipeline.processBatch(
      validated.texts.map((text) => ({
        text,
        context: pipelineContext,
        options: {
          preserveTerms: validated.options?.preserveTerms,
          mode: validated.options?.mode,
        },
      }))
    );

    const translatedResults = await Promise.all(
      results.map(async (result) => {
        const aiResult = await orchestrator.translate(result.originalText, {
          sourceLanguage: validated.sourceLanguage,
          targetLanguage: validated.targetLanguage,
          preserveTerms: validated.options?.preserveTerms,
          apiKey, // 传递 API Key
          provider: validated.provider,
        });

        return {
          sourceText: result.originalText,
          translatedText: aiResult.translatedText,
          terms: aiResult.terms,
          cached: result.cached,
        };
      })
    );

    const totalInput = validated.texts.join("").length;
    const totalOutput = translatedResults.map((i) => i.translatedText).join("").length;

    // 记录使用量
    recordUsage(totalInput, totalOutput);

    return c.json({
      items: translatedResults,
      usage: {
        inputChars: totalInput,
        outputChars: totalOutput,
      },
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

export { translateRoute };
