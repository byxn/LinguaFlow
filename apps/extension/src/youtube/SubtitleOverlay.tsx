import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import type { SubtitleSegment } from "./subtitleDetector.ts";

interface BilingualSubtitleProps {
  original: string;
  translation: string;
  visible: boolean;
  position?: "bottom" | "top";
}

function BilingualSubtitleLine({ original, translation }: BilingualSubtitleProps) {
  return (
    <div className="text-center">
      <div className="text-white text-lg leading-relaxed shadow-text">{original}</div>
      <div className="text-yellow-200 text-base leading-relaxed mt-1">{translation}</div>
    </div>
  );
}

interface SubtitleOverlayProps {
  subtitles: SubtitleSegment[];
  currentIndex: number;
  translations: Map<number, string>;
  visible: boolean;
  position?: "bottom" | "top";
}

export function SubtitleOverlay({
  subtitles,
  currentIndex,
  translations,
  visible,
  position = "bottom",
}: SubtitleOverlayProps) {
  if (!visible || currentIndex < 0 || currentIndex >= subtitles.length) {
    return null;
  }

  const current = subtitles[currentIndex];
  const translation = translations.get(currentIndex) || "";

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    bottom: position === "bottom" ? "80px" : "auto",
    top: position === "top" ? "80px" : "auto",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: "12px 24px",
    borderRadius: "8px",
    maxWidth: "800px",
    width: "100%",
  };

  return createPortal(
    <div style={overlayStyle} className="bilingual-subtitle-overlay">
      <BilingualSubtitleLine
        original={current.text}
        translation={translation}
        visible={visible}
        position={position}
      />
    </div>,
    document.body
  );
}

export function useSubtitleSync(
  subtitles: SubtitleSegment[],
  enabled: boolean
): number {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!enabled || subtitles.length === 0) {
      setCurrentIndex(-1);
      return;
    }

    const video = document.querySelector("video");
    if (!video) return;

    function updateCurrentSubtitle() {
      const currentTime = video.currentTime * 1000;

      let newIndex = -1;
      for (let i = 0; i < subtitles.length; i++) {
        if (
          currentTime >= subtitles[i].startTime &&
          currentTime <= subtitles[i].endTime
        ) {
          newIndex = i;
          break;
        }
      }

      setCurrentIndex(newIndex);
    }

    video.addEventListener("timeupdate", updateCurrentSubtitle);
    updateCurrentSubtitle();

    return () => {
      video.removeEventListener("timeupdate", updateCurrentSubtitle);
    };
  }, [subtitles, enabled]);

  return currentIndex;
}

export { BilingualSubtitleLine };
