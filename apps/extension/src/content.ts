import {
  findMainContentElement,
  scanTextNodes,
  TRANSLATED_MARK
} from "./inject/domScanner.ts"
import { initContentFeatures, hidePopup, hideTrigger, toggleSelectionEnabled } from "./content/features.ts"

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

    case "TOGGLE_SELECTION":
      toggleSelectionEnabled()
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
    if (!target) return

    // 获取元素的文本内容，而不是只检查第一个子节点
    const text = target.textContent?.trim()
    if (!text || text.length < 3 || text.length > 500) {
      return
    }

    console.log("[ReadMind] Hover翻译请求:", text.substring(0, 50))

    // 使用 async/await 方式发送消息
    chrome.runtime.sendMessage({
      type: "SHOW_HOVER",
      payload: { text }
    }).then((response) => {
      console.log("[ReadMind] Hover响应:", response)
      if (response?.success && response.data?.translatedText) {
        showHoverTooltip(target, response.data.translatedText)
      }
    }).catch((error) => {
      console.error("[ReadMind] Hover翻译失败:", error)
    })
  }, true) // 使用捕获阶段以确保能监听到所有元素
}

function showHoverTooltip(element: HTMLElement, translatedText: string) {
  const existing = document.querySelector(".ai-hover-tooltip")
  if (existing) existing.remove()

  const tooltip = document.createElement("div")
  tooltip.className = "ai-hover-tooltip"
  tooltip.textContent = translatedText
  tooltip.style.cssText = `
    position: absolute;
    z-index: 999999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    pointer-events: none;
  `

  document.body.appendChild(tooltip)

  const rect = element.getBoundingClientRect()
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`
  tooltip.style.left = `${rect.left + window.scrollX}px`

  setTimeout(() => tooltip.remove(), 3000)
}

// 初始化选中文本翻译功能（TTS、触发按钮、生词本）
initContentFeatures()

chrome.runtime.onMessage.addListener(handleMessage)

document.addEventListener(
  "translation-state-change",
  ((event: CustomEvent) => {
    translationEnabled = event.detail.translationEnabled
  }) as EventListener
)

// 关闭选文翻译弹窗当整页翻译开启时
document.addEventListener("translation-state-change", ((event: CustomEvent) => {
  if (event.detail.translationEnabled) {
    hidePopup()
    hideTrigger()
  }
}) as EventListener)

setupMutationObserver()

export { removeAllTranslations, translationEnabled }
