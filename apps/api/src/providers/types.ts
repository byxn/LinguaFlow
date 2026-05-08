export interface AIProvider {
  name: string;
  translate(text: string, options?: TranslateOptions): Promise<TranslateResult>;
  explain(text: string, options?: ExplainOptions): Promise<ExplainResult>;
}

export interface TranslateOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  preserveTerms?: boolean;
  apiKey?: string;
}

export interface TranslateResult {
  translatedText: string;
  terms: Array<{ term: string; explanation: string }>;
  model: string;
}

export interface ExplainOptions {
  context?: string;
  targetLanguage?: string;
  userLevel?: string;
}

export interface ExplainResult {
  meaning: string;
  grammar: Array<{ point: string; explanation: string }>;
  keywords: Array<{ word: string; translation: string; example?: string }>;
  simplifiedEnglish?: string;
}

export type ModelType = "openai" | "deepseek" | "claude" | "gemini";

export interface AIConfig {
  provider: ModelType;
  apiKey?: string;
  model?: string;
}
