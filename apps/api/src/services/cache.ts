import crypto from "crypto";

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000;

function generateCacheKey(
  sourceText: string,
  targetLanguage: string,
  model: string
): string {
  const data = `${sourceText}|${targetLanguage}|${model}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export class CacheService {
  private ttl: number;

  constructor(ttl: number = DEFAULT_TTL) {
    this.ttl = ttl;
  }

  get(
    sourceText: string,
    targetLanguage: string,
    model: string
  ): string | null {
    const key = generateCacheKey(sourceText, targetLanguage, model);
    const entry = memoryCache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }

    return entry.value as string;
  }

  set(
    sourceText: string,
    targetLanguage: string,
    model: string,
    translatedText: string,
    ttl?: number
  ): void {
    const key = generateCacheKey(sourceText, targetLanguage, model);
    memoryCache.set(key, {
      key,
      value: translatedText,
      expiresAt: Date.now() + (ttl || this.ttl),
    });
  }

  has(
    sourceText: string,
    targetLanguage: string,
    model: string
  ): boolean {
    const key = generateCacheKey(sourceText, targetLanguage, model);
    const entry = memoryCache.get(key);

    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    memoryCache.clear();
  }

  size(): number {
    return memoryCache.size;
  }
}

export const cacheService = new CacheService();
