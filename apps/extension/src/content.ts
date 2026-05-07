import {
  findMainContentElement,
  scanTextNodes,
  TRANSLATED_MARK
} from "./inject/domScanner.ts"

let isTranslating = false
let translationEnabled = false
let isHoverMode = false

interface TranslationState {
  originalNode: Text
  wrapper: HTMLElement
}

const translatedNodes = new Map<Text, TranslationState>()

function removeAllTranslations() {
  for (const [node, state] of translatedNodes) {
    const parent = state.wrapper.parentElement
    if (parent) {
      parent.replaceChild(node, state.wrapper)
    }
  }
  translatedNodes.clear()
}

function injectTranslation(
  originalText: string,
  translatedText: string,
  textNode: Text
) {
  const parent = textNode.parentElement
  if (!parent || translatedNodes.has(textNode)) {
    return
  }

  const wrapper = document.createElement("span")
  wrapper.setAttribute(TRANSLATED_MARK, "true")
  wrapper.className = "ai-translation-wrapper"

  const originalP = document.createElement("p")
  originalP.className = "ai-original-text"
  originalP.textContent = originalText

  const translatedP = document.createElement("p")
  translatedP.className = "ai-translated-text"
  translatedP.textContent = translatedText

  wrapper.appendChild(originalP)
  wrapper.appendChild(translatedP)

  parent.replaceChild(wrapper, textNode)
  translatedNodes.set(textNode, { originalNode: textNode, wrapper })
}

async function translateTextNode(textNode: Text): Promise<void> {
  if (isTranslating) {
    return
  }

  const originalText = textNode.textContent?.trim()
  if (!originalText) {
    return
  }

  isTranslating = true

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TRANSLATE",
      payload: {
        texts: [originalText],
        sourceLanguage: "en",
        targetLanguage: "zh-CN"
      }
    })

    if (response?.success && response.data?.items?.[0]) {
      injectTranslation(originalText, response.data.items[0].translatedText, textNode)
    }
  } catch (error) {
    console.error("Translation error:", error)
  } finally {
    isTranslating = false
  }
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const debouncedProcess = debounce(() => {
  if (!translationEnabled) {
    return
  }

  const mainContent = findMainContentElement(document)
  const nodes = scanTextNodes(mainContent)

  for (const { node } of nodes.slice(0, 5)) {
    if (
      !node.parentElement?.closest?.(`[${TRANSLATED_MARK}]`) &&
      !translatedNodes.has(node)
    ) {
      void translateTextNode(node)
    }
  }
}, 500)

function setupMutationObserver() {
  const mainContent = findMainContentElement(document)
  const observer = new MutationObserver((mutations) => {
    if (!translationEnabled) {
      return
    }

    let shouldProcess = false
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true
        break
      }
    }

    if (shouldProcess) {
      debouncedProcess()
    }
  })

  observer.observe(mainContent, {
    childList: true,
    subtree: true
  })
}

function handleMessage(message: { type: string; payload?: unknown }) {
  switch (message.type) {
    case "TOGGLE_TRANSLATION":
      translationEnabled = !translationEnabled
      if (translationEnabled) {
        void startTranslation()
      } else {
        removeAllTranslations()
      }
      notifyContentScript()
      break

    case "TOGGLE_HOVER":
      isHoverMode = !isHoverMode
      if (isHoverMode) {
        setupHoverListener()
      }
      break

    case "GET_STATUS":
      void chrome.runtime.sendMessage({
        type: "STATUS_RESPONSE",
        payload: {
          pageStatus: {
            url: window.location.href,
            language: "en",
            isTranslatable: true,
            translationEnabled
          },
          settings: {
            targetLanguage: "zh-CN",
            translationMode: "bilingual",
            autoTranslate: false,
            preserveTerms: true
          }
        }
      })
      break
  }
}

function notifyContentScript() {
  const event = new CustomEvent("translation-state-change", {
    detail: { translationEnabled }
  })
  document.dispatchEvent(event)
}

async function startTranslation() {
  const mainContent = findMainContentElement(document)
  const nodes = scanTextNodes(mainContent)

  for (const { node } of nodes.slice(0, 10)) {
    if (
      !node.parentElement?.closest?.(`[${TRANSLATED_MARK}]`) &&
      !translatedNodes.has(node)
    ) {
      await translateTextNode(node)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

function setupHoverListener() {
  document.addEventListener("mouseover", (event) => {
    if (!isHoverMode) {
      return
    }

    const target = event.target as HTMLElement
    const textNode = target.childNodes[0] as Text

    if (textNode?.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent?.trim()
      if (text && text.length > 20) {
        void chrome.runtime.sendMessage({
          type: "SHOW_HOVER",
          payload: { text, element: target }
        })
      }
    }
  })
}

chrome.runtime.onMessage.addListener(handleMessage)

document.addEventListener(
  "translation-state-change",
  ((event: CustomEvent) => {
    translationEnabled = event.detail.translationEnabled
  }) as EventListener
)

setupMutationObserver()

export { removeAllTranslations, translationEnabled }
