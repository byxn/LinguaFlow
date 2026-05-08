// UserSettings 定义
export interface UserSettings {
  userId?: string;
  targetLanguage: "zh-CN" | "en" | "ja" | "ko";
  translationMode: "bilingual" | "replace" | "hover";
  userEnglishLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  autoTranslate: boolean;
  preserveTerms: boolean;
}

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
    | "TOGGLE_HOVER"
    | "TOGGLE_SELECTION"
    | "SHOW_HOVER"
    | "GET_SETTINGS"
    | "UPDATE_SETTINGS"
    | "GET_STATUS"
    | "SAVE_SETTINGS";
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
  hoverEnabled: boolean;
}
