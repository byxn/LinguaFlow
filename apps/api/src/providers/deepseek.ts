import type { TranslateOptions, TranslateResult, ExplainOptions, ExplainResult } from "./types.ts";
import { BaseProvider } from "./base.ts";

const API_URL = "https://api.deepseek.com/v1/chat/completions";

export class DeepSeekProvider extends BaseProvider {
  name = "deepseek";

  async doTranslate(
    text: string,
    options?: TranslateOptions
  ): Promise<TranslateResult> {
    const apiKey = options?.apiKey || process.env.DEEPSEEK_API_KEY || "";

    if (!apiKey) {
      throw new Error("DeepSeek API Key not configured. Please add your API key in the extension settings.");
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
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
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        translatedText: data.choices?.[0]?.message?.content || text,
        terms: [],
        model: "deepseek-chat",
      };
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }

  async doExplain(
    text: string,
    options?: ExplainOptions
  ): Promise<ExplainResult> {
    const apiKey = options?.apiKey || process.env.DEEPSEEK_API_KEY || "";

    if (!apiKey) {
      throw new Error("DeepSeek API Key not configured. Please add your API key in the extension settings.");
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: `Explain this text in ${options?.targetLanguage || "zh-CN"}, include meaning, grammar points, and keywords: ${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // 简单解析 AI 返回的内容
      return {
        meaning: content,
        grammar: [],
        keywords: [],
      };
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }
}
