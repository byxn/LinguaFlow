import { cacheService } from "./cache.ts";

interface SubtitleCacheKey {
  videoId: string;
  language: string;
  segmentHash: string;
}

const subtitleCache = new Map<string, { translation: string; expiresAt: number }>();

function generateSubtitleKey(
  videoId: string,
  language: string,
  segmentText: string
): string {
  const hash = Buffer.from(segmentText).toString("base64").slice(0, 16);
  return `${videoId}:${language}:${hash}`;
}

export class SubtitleCacheService {
  get(videoId: string, language: string, segmentText: string): string | null {
    const key = generateSubtitleKey(videoId, language, segmentText);
    const entry = subtitleCache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      subtitleCache.delete(key);
      return null;
    }

    return entry.translation;
  }

  set(
    videoId: string,
    language: string,
    segmentText: string,
    translation: string,
    ttl: number = 30 * 24 * 60 * 60 * 1000
  ): void {
    const key = generateSubtitleKey(videoId, language, segmentText);
    subtitleCache.set(key, {
      translation,
      expiresAt: Date.now() + ttl,
    });
  }

  clear(): void {
    subtitleCache.clear();
  }
}

export const subtitleCacheService = new SubtitleCacheService();
