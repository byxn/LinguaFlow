export {
  isYouTubePage,
  detectSubtitleTrack,
  extractSubtitles,
  setupSubtitleObserver,
  cleanupSubtitleObserver,
} from "./subtitleDetector.ts";
export type { SubtitleSegment } from "./subtitleDetector.ts";
export { SubtitleOverlay, useSubtitleSync, BilingualSubtitleLine } from "./SubtitleOverlay.tsx";
