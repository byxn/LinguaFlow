import type { UserSettings } from "@readmind/types";

export interface TranslationRequest {
  texts: string[];
  sourceLanguage: string;
  targetLanguage: string;
  context?: {
    url?: string;
    title?: string;
    domain?: string;
  };
  options?: {
    preserveTerms?: boolean;
    mode?: "paragraph" | "sentence";
  };
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  terms: Array<{ term: string; explanation: string }>;
  cached: boolean;
}

export interface ExtensionMessage {
  type:
    | "TRANSLATE"
    | "EXPLAIN"
    | "TOGGLE_TRANSLATION"
    | "GET_SETTINGS"
    | "UPDATE_SETTINGS"
    | "GET_STATUS";
  payload?: unknown;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PageStatus {
  url: string;
  language: string;
  isTranslatable: boolean;
  translationEnabled: boolean;
}
