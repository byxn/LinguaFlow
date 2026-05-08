import { useState, useEffect } from "react";
import type { PageStatus, UserSettings } from "../types.ts";

interface PopupState {
  pageStatus: PageStatus | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  apiKey: string;
}

export function usePopupState() {
  const [state, setState] = useState<PopupState>({
    pageStatus: null,
    settings: null,
    loading: true,
    error: null,
    apiKey: "",
  });

  useEffect(() => {
    // 获取状态和 API Key
    chrome.runtime.sendMessage(
      { type: "GET_STATUS" },
      (response) => {
        if (response?.success && response.data) {
          setState((prev) => ({
            ...prev,
            pageStatus: response.data.pageStatus,
            settings: response.data.settings,
            loading: false,
            error: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response?.error?.message || "Failed to get page status",
          }));
        }
      }
    );

    // 从 storage 加载 API Key
    chrome.storage.local.get(["deepseekApiKey"], (result) => {
      if (result.deepseekApiKey) {
        setState((prev) => ({ ...prev, apiKey: result.deepseekApiKey }));
      }
    });
  }, []);

  const toggleTranslation = () => {
    chrome.runtime.sendMessage({ type: "TOGGLE_TRANSLATION" });
    setState((prev) => ({
      ...prev,
      pageStatus: prev.pageStatus
        ? {
            ...prev.pageStatus,
            translationEnabled: !prev.pageStatus.translationEnabled,
          }
        : null,
    }));
  };

  const toggleHover = () => {
    chrome.runtime.sendMessage({ type: "TOGGLE_HOVER" });
    setState((prev) => ({
      ...prev,
      pageStatus: prev.pageStatus
        ? {
            ...prev.pageStatus,
            hoverEnabled: !prev.pageStatus.hoverEnabled,
          }
        : null,
    }));
  };

  const saveApiKey = (key: string) => {
    chrome.storage.local.set({ deepseekApiKey: key });
    setState((prev) => ({ ...prev, apiKey: key }));
  };

  return { ...state, toggleTranslation, toggleHover, saveApiKey };
}
