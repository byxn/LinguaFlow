import type {
  ExtensionMessage,
  ExtensionResponse,
  PageStatus,
  TranslationRequest,
} from "../types.ts";

// API 地址
const API_BASE = "http://localhost:3002/api";

const debounceMap = new Map<string, number>();
const DEBOUNCE_DELAY = 300;

// 跟踪各tab的悬停模式状态
const hoverModeMap = new Map<number, boolean>();

// Provider 类型
type ProviderType = "deepseek" | "openai" | "deepl" | "google";

interface ExtensionSettings {
  provider: ProviderType;
  apiKeys: {
    deepseek?: string;
    openai?: string;
    deepl?: string;
    google?: string;
  };
}

// 获取存储的设置
async function getSettings(): Promise<ExtensionSettings> {
  // 优先从 API 获取（Web 页面保存的设置）
  try {
    const response = await fetch(`${API_BASE}/extension/settings`);
    if (response.ok) {
      const data = await response.json();
      if (data.provider && data.apiKeys) {
        // 保存到本地缓存
        chrome.storage.local.set({ settings: data });
        return data as ExtensionSettings;
      }
    }
  } catch {
    // API 不可用，使用本地存储
  }

  // 回退到 chrome.storage.local
  return new Promise((resolve) => {
    chrome.storage.local.get(["settings"], (result) => {
      const defaults: ExtensionSettings = {
        provider: "deepseek",
        apiKeys: {},
      };
      resolve({ ...defaults, ...result.settings });
    });
  });
}

// 获取当前 provider 和对应的 API Key
async function getProviderConfig(): Promise<{ provider: ProviderType; apiKey: string }> {
  const settings = await getSettings();
  const { provider, apiKeys } = settings;
  const apiKey = apiKeys[provider] || "";
  return { provider, apiKey };
}

// 发送翻译请求
async function fetchTranslation(payload: TranslationRequest, provider: ProviderType, apiKey: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // 添加 provider 到 payload
  const requestPayload = { ...payload, provider };

  const response = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestPayload),
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
          const { provider, apiKey } = await getProviderConfig();
          const data = await fetchTranslation(payload, provider, apiKey);
          return { success: true, data };
        }

        case "SHOW_HOVER": {
          const { text } = message.payload as { text: string };
          console.log("[Background] SHOW_HOVER:", text.substring(0, 30));
          const { provider, apiKey } = await getProviderConfig();
          try {
            const data = await fetchTranslation({
              texts: [text],
              sourceLanguage: "en",
              targetLanguage: "zh-CN",
              options: { preserveTerms: true }
            }, provider, apiKey);
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

        case "TOGGLE_SELECTION": {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tab.id) {
            await chrome.tabs.sendMessage(tab.id, message);
          }
          return { success: true };
        }

        case "SAVE_SETTINGS": {
          const { settings } = message.payload as { settings: ExtensionSettings };
          chrome.storage.local.set({ settings });
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
