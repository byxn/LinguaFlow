import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

export class OpenAIProvider extends BaseProvider {
  name = "openai";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    return {
      translatedText: `[OpenAI] ${text}`,
      terms: [],
      model: "gpt-4",
    };
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    return {
      meaning: `[OpenAI] ${text}`,
      grammar: [],
      keywords: [],
    };
  }
}
