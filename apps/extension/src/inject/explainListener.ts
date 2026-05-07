import { ExplainModal } from "./ExplainModal.tsx";

let selectedText = "";
let modalVisible = false;
let modalPosition = { top: 100, left: 100 };

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (text && text.length > 5 && text.length < 500) {
    selectedText = text;

    const range = selection?.getRangeAt(0);
    if (range) {
      const rect = range.getBoundingClientRect();
      modalPosition = {
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
      };
    }

    modalVisible = true;
    showExplainModal();
  }
}

let explainModalElement: HTMLElement | null = null;

function showExplainModal() {
  if (explainModalElement) {
    explainModalElement.dispatchEvent(
      new CustomEvent("show-explain", {
        detail: { text: selectedText, position: modalPosition },
      })
    );
  }
}

function hideExplainModal() {
  modalVisible = false;
  selectedText = "";

  if (explainModalElement) {
    explainModalElement.dispatchEvent(new CustomEvent("hide-explain"));
  }
}

export function setupExplainListener() {
  document.addEventListener("mouseup", handleTextSelection);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "CLOSE_EXPLAIN") {
      hideExplainModal();
    }
  });
}

export { ExplainModal, showExplainModal, hideExplainModal };
