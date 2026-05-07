import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ExplainData {
  meaning: string;
  grammar: Array<{ point: string; explanation: string }>;
  keywords: Array<{ word: string; translation: string; example?: string }>;
  simplifiedEnglish?: string;
}

interface ExplainModalProps {
  text: string;
  visible: boolean;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function ExplainModal({
  text,
  visible,
  onClose,
  position,
}: ExplainModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExplainData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && text) {
      fetchExplanation(text);
    }
  }, [visible, text, retryCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  async function fetchExplanation(text: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "EXPLAIN",
        payload: {
          text,
          targetLanguage: "zh-CN",
        },
      });

      if (response?.success && response.data) {
        setData(response.data);
      } else {
        setError(response?.error?.message || "Failed to get explanation");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    setRetryCount((prev) => prev + 1);
  }

  if (!visible) return null;

  const defaultPosition = { top: 100, left: 100 };
  const pos = position || defaultPosition;

  const modal = (
    <div
      ref={modalRef}
      className="fixed z-[2147483647] bg-white rounded-lg shadow-xl border border-gray-200 w-[400px] max-h-[500px] overflow-auto"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
    >
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">AI Explanation</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Analyzing...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {data && !loading && (
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Meaning</h4>
              <p className="text-gray-800">{data.meaning}</p>
            </div>

            {data.grammar.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Grammar</h4>
                <div className="space-y-2">
                  {data.grammar.map((g, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-blue-600">{g.point}:</span>
                      <span className="text-gray-700 ml-2">{g.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Keywords</h4>
                <div className="space-y-2">
                  {data.keywords.map((k, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-purple-600">{k.word}</span>
                      <span className="text-gray-500 ml-2">=</span>
                      <span className="text-gray-700 ml-2">{k.translation}</span>
                      {k.example && (
                        <p className="text-xs text-gray-400 mt-1">{k.example}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.simplifiedEnglish && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Simplified
                </h4>
                <p className="text-sm text-gray-600 italic">
                  {data.simplifiedEnglish}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  chrome.runtime.sendMessage({
                    type: "ADD_VOCABULARY",
                    payload: { word: text, translation: data?.meaning },
                  });
                }}
                className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100"
              >
                Save to Vocabulary
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
