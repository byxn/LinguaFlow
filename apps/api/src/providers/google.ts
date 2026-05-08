import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

const API_URL = "https://translate.googleapis.com/translate_a/single";

export class GoogleProvider extends BaseProvider {
  name = "google";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    try {
      const params = new URLSearchParams();
      params.set("client", "gtx");
      params.set("sl", this.mapLangCode(options?.sourceLanguage || "auto"));
      params.set("tl", this.mapLangCode(options?.targetLanguage || "zh-CN"));
      params.set("dt", "t");
      params.set("q", text);

      const response = await fetch(`${API_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json();
      const chunks = Array.isArray(data?.[0]) ? data[0] : [];
      const translatedText = chunks
        .map((part: unknown[]) => (Array.isArray(part) ? part[0] : ""))
        .filter(Boolean)
        .join("");

      return {
        translatedText: translatedText || text,
        terms: [],
        model: "google-translate",
      };
    } catch (error) {
      console.error("Google Translate API error:", error);
      throw error;
    }
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    // Google Translate doesn't have an explain endpoint
    const translated = await this.doTranslate(text, options);
    return {
      meaning: translated.translatedText,
      grammar: [],
      keywords: [],
    };
  }

  private mapLangCode(code: string): string {
    if (code === "auto") return "auto";
    const mapping: Record<string, string> = {
      "zh-CN": "zh-CN",
      "zh": "zh",
      "en": "en",
      "ja": "ja",
      "ko": "ko",
      "fr": "fr",
      "de": "de",
      "es": "es",
      "it": "it",
      "pt": "pt",
      "ru": "ru",
    };
    return mapping[code] || code;
  }
}
