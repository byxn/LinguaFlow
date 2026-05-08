// Content Script 功能模块
// 包含: TTS朗读、生词本、触发按钮UI

// ============ TTS 文本朗读 ============

export function speakText(text: string, lang: string = "en"): void {
  if (!("speechSynthesis" in window)) {
    console.log("[ReadMind] Speech synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;

  utterance.onend = () => console.log("[ReadMind] TTS finished");
  utterance.onerror = (e) => console.error("[ReadMind] TTS error:", e);

  window.speechSynthesis.speak(utterance);
}

export function inferLang(text: string): string {
  if (/[一-鿿]/.test(text)) return "zh-CN";
  if (/[぀-ヿ]/.test(text)) return "ja-JP";
  if (/[가-힯]/.test(text)) return "ko-KR";
  return "en-US";
}

// ============ 生词本 ============

export interface VocabItem {
  id: string;
  term: string;
  translation: string;
  context?: string;
  sourceLang?: string;
  targetLang?: string;
  provider?: string;
  queryCount: number;
  createdAt: string;
}

export async function saveVocab(item: Omit<VocabItem, "id" | "queryCount" | "createdAt">): Promise<VocabItem> {
  const record: VocabItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queryCount: 1,
    createdAt: new Date().toISOString(),
  };

  const result = await chrome.storage.local.get(["vocabList"]);
  const list: VocabItem[] = result.vocabList || [];

  const existingIndex = list.findIndex((v) => v.term.toLowerCase() === item.term.toLowerCase());
  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...record, queryCount: list[existingIndex].queryCount + 1 };
  } else {
    list.unshift(record);
  }

  await chrome.storage.local.set({ vocabList: list });
  return record;
}

export async function getVocabList(): Promise<VocabItem[]> {
  const result = await chrome.storage.local.get(["vocabList"]);
  return result.vocabList || [];
}

export async function deleteVocab(id: string): Promise<void> {
  const result = await chrome.storage.local.get(["vocabList"]);
  const list: VocabItem[] = result.vocabList || [];
  const filtered = list.filter((v) => v.id !== id);
  await chrome.storage.local.set({ vocabList: filtered });
}

export async function isTermFavorited(term: string): Promise<boolean> {
  const list = await getVocabList();
  return list.some((v) => v.term.toLowerCase() === term.toLowerCase());
}

export async function exportVocab(): Promise<string> {
  const list = await getVocabList();
  return JSON.stringify(list, null, 2);
}

// ============ 触发按钮和弹窗 ============

const ICONS = {
  speaker: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  heartOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
};

interface PopupState {
  selectedText: string;
  translation: string;
  isFavorite: boolean;
}

let popup: HTMLElement | null = null;
let trigger: HTMLElement | null = null;
let currentState: PopupState = { selectedText: "", translation: "", isFavorite: false };

function createPopup() {
  if (popup) return;

  popup = document.createElement("div");
  popup.id = "readmind-popup";
  popup.innerHTML = `
    <div class="rm-header">
      <div class="rm-word-row">
        <span class="rm-word" id="rm-word">Translate</span>
      </div>
      <div class="rm-actions">
        <button class="rm-icon-btn" id="rm-speak-source" title="朗读原文">${ICONS.speaker}</button>
        <button class="rm-icon-btn" id="rm-favorite" title="添加到生词本">${ICONS.heartOutline}</button>
        <button class="rm-icon-btn rm-close" id="rm-close">${ICONS.close}</button>
      </div>
    </div>
    <div class="rm-body" id="rm-body"></div>
    <div class="rm-footer">
      <button class="rm-icon-btn" id="rm-speak-translation" title="朗读译文">${ICONS.speaker}</button>
    </div>
  `;

  // 添加样式
  const style = document.createElement("style");
  style.textContent = `
    #readmind-popup {
      position: fixed;
      z-index: 999999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      min-width: 280px;
      max-width: 480px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: white;
      display: none;
      overflow: hidden;
    }
    #readmind-popup.rm-visible { display: block; }
    .rm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .rm-word-row { flex: 1; }
    .rm-word { font-size: 16px; font-weight: 600; }
    .rm-actions { display: flex; gap: 8px; }
    .rm-icon-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background 0.2s;
    }
    .rm-icon-btn:hover { background: rgba(255,255,255,0.3); }
    .rm-icon-btn svg { width: 18px; height: 18px; }
    .rm-body {
      padding: 12px 16px;
      max-height: 300px;
      overflow-y: auto;
    }
    .rm-source {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 8px;
      word-break: break-word;
    }
    .rm-translation {
      font-size: 16px;
      line-height: 1.5;
      word-break: break-word;
    }
    .rm-loading, .rm-error {
      font-size: 14px;
      padding: 20px;
      text-align: center;
    }
    .rm-error { color: #ff6b6b; }
    .rm-footer {
      display: flex;
      justify-content: flex-end;
      padding: 8px 16px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .rm-favorite.is-favorite { color: #ff6b6b; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(popup);

  // 绑定事件
  popup.querySelector("#rm-close")?.addEventListener("click", hidePopup);
  popup.querySelector("#rm-speak-source")?.addEventListener("click", () => {
    speakText(currentState.selectedText, inferLang(currentState.selectedText));
  });
  popup.querySelector("#rm-speak-translation")?.addEventListener("click", () => {
    speakText(currentState.translation, "zh-CN");
  });
  popup.querySelector("#rm-favorite")?.addEventListener("click", toggleFavorite);
}

function createTrigger() {
  if (trigger) return;

  trigger = document.createElement("button");
  trigger.id = "readmind-trigger";
  trigger.textContent = "译";
  trigger.title = "点击翻译";

  const style = document.createElement("style");
  style.textContent = `
    #readmind-trigger {
      position: fixed;
      z-index: 999998;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    #readmind-trigger.rm-visible { display: flex; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(trigger);

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    requestTranslation();
  });
}

function showPopupNearRect(rect: DOMRect) {
  createPopup();
  if (!popup) return;

  popup.classList.add("rm-visible");

  const popupRect = popup.getBoundingClientRect();
  const margin = 10;
  let left = rect.left;
  let top = rect.bottom + 8;

  if (left + popupRect.width > window.innerWidth - margin) {
    left = window.innerWidth - popupRect.width - margin;
  }
  if (top + popupRect.height > window.innerHeight - margin) {
    top = rect.top - popupRect.height - 8;
  }

  popup.style.left = `${left + window.scrollX}px`;
  popup.style.top = `${top + window.scrollY}px`;
}

function showTriggerNearRect(rect: DOMRect) {
  createTrigger();
  if (!trigger) return;

  const margin = 10;
  let left = rect.right + 6;
  let top = rect.bottom + 4;

  if (left + 30 > window.innerWidth - margin) {
    left = rect.left - 36;
  }

  trigger.style.left = `${left + window.scrollX}px`;
  trigger.style.top = `${top + window.scrollY}px`;
  trigger.classList.add("rm-visible");
}

function hidePopup() {
  if (popup) {
    popup.classList.remove("rm-visible");
  }
}

function hideTrigger() {
  if (trigger) {
    trigger.classList.remove("rm-visible");
  }
}

function renderLoading(text: string) {
  if (!popup) return;
  const body = popup.querySelector("#rm-body");
  const word = popup.querySelector("#rm-word");
  if (word) word.textContent = "翻译中...";
  if (body) body.innerHTML = `<div class="rm-source">${escapeHtml(text)}</div><div class="rm-loading">翻译中...</div>`;
  const favBtn = popup.querySelector("#rm-favorite");
  if (favBtn) favBtn.innerHTML = ICONS.heartOutline;
}

function renderError(message: string) {
  if (!popup) return;
  const body = popup.querySelector("#rm-body");
  const word = popup.querySelector("#rm-word");
  if (word) word.textContent = "翻译失败";
  if (body) body.innerHTML = `<div class="rm-error">${escapeHtml(message)}</div>`;
}

function renderResult(text: string, translation: string, isFavorite: boolean) {
  if (!popup) return;
  currentState.selectedText = text;
  currentState.translation = translation;
  currentState.isFavorite = isFavorite;

  const body = popup.querySelector("#rm-body");
  const word = popup.querySelector("#rm-word");
  const favBtn = popup.querySelector("#rm-favorite");

  if (word) word.textContent = "翻译";
  if (body) body.innerHTML = `
    <div class="rm-source">${escapeHtml(text)}</div>
    <div class="rm-translation">${escapeHtml(translation)}</div>
  `;
  if (favBtn) {
    favBtn.innerHTML = isFavorite ? ICONS.heart : ICONS.heartOutline;
    favBtn.classList.toggle("is-favorite", isFavorite);
  }
}

async function toggleFavorite() {
  if (!currentState.selectedText || !currentState.translation) return;

  try {
    if (currentState.isFavorite) {
      const list = await getVocabList();
      const item = list.find((v) => v.term === currentState.selectedText);
      if (item) await deleteVocab(item.id);
      currentState.isFavorite = false;
    } else {
      await saveVocab({
        term: currentState.selectedText,
        translation: currentState.translation,
      });
      currentState.isFavorite = true;
    }
    const favBtn = popup?.querySelector("#rm-favorite");
    if (favBtn) {
      favBtn.innerHTML = currentState.isFavorite ? ICONS.heart : ICONS.heartOutline;
      favBtn.classList.toggle("is-favorite", currentState.isFavorite);
    }
  } catch (e) {
    console.error("[ReadMind] Favorite toggle error:", e);
  }
}

async function requestTranslation() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const text = selection.toString().trim();
  if (!text || text.length < 2) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  hideTrigger();
  showPopupNearRect(rect);
  renderLoading(text);

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SHOW_HOVER",
      payload: { text }
    });

    if (response?.success && response.data?.translatedText) {
      const isFav = await isTermFavorited(text);
      renderResult(text, response.data.translatedText, isFav);
    } else {
      renderError(response?.error?.message || "翻译失败");
    }
  } catch (e) {
    renderError("翻译请求失败");
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============ 初始化 ============

let selectionCheckTimer: ReturnType<typeof setTimeout> | null = null;
let selectionEnabled = false;

export function setSelectionEnabled(enabled: boolean) {
  selectionEnabled = enabled;
  if (!enabled) {
    hideTrigger();
    hidePopup();
  }
}

export function toggleSelectionEnabled() {
  selectionEnabled = !selectionEnabled;
  if (!selectionEnabled) {
    hideTrigger();
    hidePopup();
  }
}

function setupSelectionListener() {
  document.addEventListener("mouseup", () => {
    if (selectionCheckTimer) clearTimeout(selectionCheckTimer);
    selectionCheckTimer = setTimeout(checkSelection, 180);
  });

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.altKey && (e.key === "t" || e.key === "T")) {
      requestTranslation();
    }
  });
}

function checkSelection() {
  if (!selectionEnabled) {
    hideTrigger();
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === "") {
    hideTrigger();
    return;
  }

  const text = selection.toString().trim();
  if (text.length < 2) {
    hideTrigger();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  showTriggerNearRect(rect);
}

export function initContentFeatures() {
  console.log("[ReadMind] Initializing content features...");
  setupSelectionListener();
}

export { hidePopup, hideTrigger };
