import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

export class DeepSeekProvider extends BaseProvider {
  name = "deepseek";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    return {
      translatedText: `[DeepSeek] ${text}`,
      terms: [],
      model: "deepseek-chat",
    };
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    return {
      meaning: `[DeepSeek] ${text}`,
      grammar: [],
      keywords: [],
    };
  }
}
