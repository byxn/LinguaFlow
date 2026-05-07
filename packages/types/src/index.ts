export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'team';
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  targetLanguage: 'zh-CN' | 'en' | 'ja' | 'ko';
  translationMode: 'bilingual' | 'replace' | 'hover';
  userEnglishLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  autoTranslate: boolean;
  preserveTerms: boolean;
}

export interface TranslationCache {
  id: string;
  sourceHash: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  model: string;
  createdAt: string;
  expiresAt?: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  word: string;
  translation: string;
  phonetic?: string;
  sourceSentence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  status: 'new' | 'learning' | 'mastered';
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  type: 'translate' | 'explain' | 'summarize' | 'subtitle';
  inputChars: number;
  outputChars: number;
  model: string;
  cost?: number;
  createdAt: string;
}

export interface TranslateRequest {
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
    mode?: 'paragraph' | 'sentence';
  };
}

export interface TranslateItem {
  sourceText: string;
  translatedText: string;
  terms: Array<{
    term: string;
    explanation: string;
  }>;
  cached: boolean;
}

export interface TranslateResponse {
  items: TranslateItem[];
  usage: {
    inputChars: number;
    outputChars: number;
  };
}

export interface ExplainRequest {
  text: string;
  context?: string;
  targetLanguage: string;
  userLevel?: string;
}

export interface ExplainResponse {
  meaning: string;
  grammar: Array<{
    point: string;
    explanation: string;
  }>;
  keywords: Array<{
    word: string;
    translation: string;
    example?: string;
  }>;
  simplifiedEnglish?: string;
}

export interface VocabularyRequest {
  word: string;
  translation: string;
  sourceSentence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export type QuotaResponse = {
  plan: 'free' | 'pro' | 'team';
  dailyLimit: number;
  dailyUsed: number;
  resetAt: string;
};
