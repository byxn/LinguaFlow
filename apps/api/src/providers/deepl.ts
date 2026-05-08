import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

const API_URL = "https://api-free.deepl.com/v2/translate";

export class DeepLProvider extends BaseProvider {
  name = "deepl";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    const apiKey = options?.apiKey || process.env.DEEPL_API_KEY || "";

    if (!apiKey) {
      throw new Error("DeepL API Key not configured. Please add your API key in the extension settings.");
    }

    try {
      const params = new URLSearchParams();
      params.set("text", text);
      params.set("target_lang", this.mapLangCode(options?.targetLanguage || "zh-CN"));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `DeepL-Auth-Key ${apiKey}`,
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => "");
        throw new Error(`DeepL API error: ${response.status} - ${errorData.slice(0, 200)}`);
      }

      const data = await response.json();
      const translatedText = data.translations?.[0]?.text || text;

      return {
        translatedText,
        terms: [],
        model: "deepl",
      };
    } catch (error) {
      console.error("DeepL API error:", error);
      throw error;
    }
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    // DeepL doesn't have an explain endpoint, so we just return the text
    const translated = await this.doTranslate(text, options);
    return {
      meaning: translated.translatedText,
      grammar: [],
      keywords: [],
    };
  }

  private mapLangCode(code: string): string {
    const mapping: Record<string, string> = {
      "zh-CN": "ZH",
      "zh": "ZH",
      "en": "EN",
      "ja": "JA",
      "ko": "KO",
      "fr": "FR",
      "de": "DE",
      "es": "ES",
      "it": "IT",
      "pt": "PT",
      "ru": "RU",
    };
    return mapping[code] || code.toUpperCase();
  }
}
