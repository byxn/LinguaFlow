import type {
  AIProvider,
  TranslateOptions,
  TranslateResult,
  ExplainOptions,
  ExplainResult,
} from "./types.ts";
import { glossaryService } from "../services/glossary.ts";

export abstract class BaseProvider implements AIProvider {
  abstract name: string;

  async translate(text: string, options?: TranslateOptions): Promise<TranslateResult> {
    const { protectedText, terms } = glossaryService.protectTerms(text);

    const result = await this.doTranslate(protectedText, options);

    return {
      ...result,
      translatedText: glossaryService.restoreTerms(
        result.translatedText,
        terms.map((t) => ({ original: t.original, placeholder: t.placeholder }))
      ),
    };
  }

  abstract doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult>;

  async explain(text: string, options?: ExplainOptions): Promise<ExplainResult> {
    return this.doExplain(text, options);
  }

  abstract doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult>;
}
