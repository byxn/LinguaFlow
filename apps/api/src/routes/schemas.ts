import { z } from "zod";

export const TranslateRequestSchema = z.object({
  texts: z.array(z.string()).min(1),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  provider: z.enum(["openai", "deepseek", "deepl", "google"]).optional(),
  context: z
    .object({
      url: z.string().optional(),
      title: z.string().optional(),
      domain: z.string().optional(),
    })
    .optional(),
  options: z
    .object({
      preserveTerms: z.boolean().optional(),
      mode: z.enum(["paragraph", "sentence"]).optional(),
    })
    .optional(),
});

export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
