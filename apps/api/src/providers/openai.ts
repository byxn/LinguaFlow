import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

const API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIProvider extends BaseProvider {
  name = "openai";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("OpenAI API Key not configured. Please add your API key in the extension settings.");
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: `Translate to ${options?.targetLanguage || "zh-CN"}: ${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        translatedText: data.choices?.[0]?.message?.content || text,
        terms: [],
        model: "gpt-4o-mini",
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("OpenAI API Key not configured. Please add your API key in the extension settings.");
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `Explain this text in ${options?.targetLanguage || "zh-CN"}: ${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        meaning: data.choices?.[0]?.message?.content || "",
        grammar: [],
        keywords: [],
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
}
