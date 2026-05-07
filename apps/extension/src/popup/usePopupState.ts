import { useState, useEffect } from "react";
import type { PageStatus, UserSettings } from "../types.ts";

interface PopupState {
  pageStatus: PageStatus | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
}

export function usePopupState() {
  const [state, setState] = useState<PopupState>({
    pageStatus: null,
    settings: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_STATUS" },
          (response) => {
            if (response?.success && response.data) {
              setState({
                pageStatus: response.data.pageStatus,
                settings: response.data.settings,
                loading: false,
                error: null,
              });
            } else {
              setState((prev) => ({
                ...prev,
                loading: false,
                error: "Failed to get page status",
              }));
            }
          }
        );
      }
    });
  }, []);

  const toggleTranslation = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TRANSLATION" });
        setState((prev) => ({
          ...prev,
          pageStatus: prev.pageStatus
            ? {
                ...prev.pageStatus,
                translationEnabled: !prev.pageStatus.translationEnabled,
              }
            : null,
        }));
      }
    });
  };

  const toggleHover = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_HOVER" });
      }
    });
  };

  return { ...state, toggleTranslation, toggleHover };
}
