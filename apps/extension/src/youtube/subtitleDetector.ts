const YOUTUBE_SELECTORS = {
  videoContainer: ".html5-video-container",
  subtitleContainer: ".ytp-subtitles-container",
  subtitleText: ".ytp-subtitle-label",
  subtitleSegment: ".ytp-subtitle-segment",
  videoPlayer: "#movie_player",
};

interface SubtitleSegment {
  text: string;
  startTime: number;
  endTime: number;
}

let subtitleObserver: MutationObserver | null = null;
let currentSubtitles: SubtitleSegment[] = [];

export function isYouTubePage(): boolean {
  return window.location.hostname.includes("youtube.com") &&
    window.location.pathname === "/watch";
}

export function detectSubtitleTrack(): boolean {
  const subtitleContainer = document.querySelector(
    YOUTUBE_SELECTORS.subtitleContainer
  );
  return subtitleContainer !== null;
}

export function extractSubtitles(): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  const subtitleElements = document.querySelectorAll(
    YOUTUBE_SELECTORS.subtitleSegment
  );

  subtitleElements.forEach((el) => {
    const textEl = el.querySelector(YOUTUBE_SELECTORS.subtitleText);
    const text = textEl?.textContent?.trim() || "";

    if (text) {
      const startTime =
        parseFloat(el.getAttribute("data-start-time") || "0") * 1000;
      const endTime =
        parseFloat(el.getAttribute("data-end-time") || "0") * 1000;

      segments.push({ text, startTime, endTime });
    }
  });

  return segments;
}

export function setupSubtitleObserver(
  onSubtitlesChange: (subtitles: SubtitleSegment[]) => void
) {
  const subtitleContainer = document.querySelector(
    YOUTUBE_SELECTORS.subtitleContainer
  );
  if (!subtitleContainer) return;

  subtitleObserver = new MutationObserver((mutations) => {
    let hasChanges = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      const newSubtitles = extractSubtitles();
      if (JSON.stringify(newSubtitles) !== JSON.stringify(currentSubtitles)) {
        currentSubtitles = newSubtitles;
        onSubtitlesChange(newSubtitles);
      }
    }
  });

  subtitleObserver.observe(subtitleContainer, {
    childList: true,
    subtree: true,
  });
}

export function cleanupSubtitleObserver() {
  if (subtitleObserver) {
    subtitleObserver.disconnect();
    subtitleObserver = null;
  }
  currentSubtitles = [];
}

export type { SubtitleSegment };
