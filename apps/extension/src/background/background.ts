import type {
  ExtensionMessage,
  ExtensionResponse,
  PageStatus,
  TranslationRequest,
} from "../types.ts";

const API_BASE = "http://localhost:3001/api";

const debounceMap = new Map<string, number>();
const DEBOUNCE_DELAY = 300;

chrome.runtime.onMessage.addListener(
  async (message: ExtensionMessage): Promise<ExtensionResponse> => {
    try {
      switch (message.type) {
        case "TRANSLATE": {
          const payload = message.payload as TranslationRequest;
          const response = await fetch(`${API_BASE}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          return { success: true, data };
        }

        case "SHOW_HOVER": {
          const { text } = message.payload as { text: string };
          return { success: true };
        }

        case "GET_STATUS": {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          const pageStatus: PageStatus = {
            url: tab.url || "",
            language: "en",
            isTranslatable: true,
            translationEnabled: false,
          };
          return { success: true, data: { pageStatus } };
        }

        default:
          return {
            success: false,
            error: {
              code: "UNKNOWN_MESSAGE",
              message: "Unknown message type",
            },
          };
      }
    } catch (error) {
      return {
        success: false,
        error: { code: "INTERNAL_ERROR", message: String(error) },
      };
    }
  }
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Translate this text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "explain-selection",
    title: "Explain this text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "add-to-vocabulary",
    title: "Add to vocabulary",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;

  switch (info.menuItemId) {
    case "translate-selection":
      chrome.runtime.sendMessage({
        type: "TRANSLATE",
        payload: {
          texts: [info.selectionText],
          sourceLanguage: "en",
          targetLanguage: "zh-CN",
        },
      });
      break;

    case "explain-selection":
      chrome.runtime.sendMessage({
        type: "EXPLAIN",
        payload: {
          text: info.selectionText,
          targetLanguage: "zh-CN",
        },
      });
      break;

    case "add-to-vocabulary":
      chrome.runtime.sendMessage({
        type: "ADD_VOCABULARY",
        payload: {
          word: info.selectionText,
          translation: "",
          sourceSentence: info.selectionText,
        },
      });
      break;
  }
});

export function debounceRequest(key: string, delay: number): boolean {
  const now = Date.now();
  const lastRequest = debounceMap.get(key) || 0;

  if (now - lastRequest < delay) {
    return false;
  }

  debounceMap.set(key, now);
  return true;
}
