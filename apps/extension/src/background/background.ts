import type {
  ExtensionMessage,
  ExtensionResponse,
  PageStatus,
  TranslationRequest,
} from "../types.ts";

// API 地址 - 开发环境默认 localhost:3002
// 生产环境可通过设置 PLASMO_PUBLIC_API_URL 环境变量覆盖
// 例如: PLASMO_PUBLIC_API_URL=https://api.example.com
const API_BASE = "http://localhost:3002/api";

const debounceMap = new Map<string, number>();
const DEBOUNCE_DELAY = 300;

// 跟踪各tab的悬停模式状态
const hoverModeMap = new Map<number, boolean>();

// 获取存储的 API Key
async function getApiKey(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["deepseekApiKey"], (result) => {
      resolve(result.deepseekApiKey || "");
    });
  });
}

// 发送翻译请求（带 API Key）
async function fetchTranslation(payload: TranslationRequest, apiKey: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}

chrome.runtime.onMessage.addListener(
  async (message: ExtensionMessage): Promise<ExtensionResponse> => {
    console.log("[Background] Received message:", message.type);
    try {
      switch (message.type) {
        case "TRANSLATE": {
          const payload = message.payload as TranslationRequest;
          const apiKey = await getApiKey();
          const data = await fetchTranslation(payload, apiKey);
          return { success: true, data };
        }

        case "SHOW_HOVER": {
          const { text } = message.payload as { text: string };
          console.log("[Background] SHOW_HOVER:", text.substring(0, 30));
          const apiKey = await getApiKey();
          try {
            const data = await fetchTranslation({
              texts: [text],
              sourceLanguage: "en",
              targetLanguage: "zh-CN",
              options: { preserveTerms: true }
            }, apiKey);
            console.log("[Background] 翻译结果:", data);
            const translatedText = data.items?.[0]?.translatedText || text;
            return { success: true, data: { translatedText } };
          } catch (error) {
            console.error("[Background] 翻译失败:", error);
            return { success: false, error: { code: "HOVER_ERROR", message: String(error) } };
          }
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
            hoverEnabled: tab.id ? (hoverModeMap.get(tab.id) ?? false) : false,
          };
          return { success: true, data: { pageStatus } };
        }

        case "TOGGLE_TRANSLATION": {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tab.id) {
            await chrome.tabs.sendMessage(tab.id, message);
          }
          return { success: true };
        }

        case "TOGGLE_HOVER": {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tab.id) {
            const currentState = hoverModeMap.get(tab.id) ?? false;
            hoverModeMap.set(tab.id, !currentState);
            await chrome.tabs.sendMessage(tab.id, message);
          }
          return { success: true };
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
