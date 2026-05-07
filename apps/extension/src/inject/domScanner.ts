const SKIP_TAGS = new Set([
  "script",
  "style",
  "code",
  "pre",
  "textarea",
  "input",
  "select",
  "button",
  "nav",
  "footer",
  "aside",
  "header",
]);

const CONTENT_SELECTORS = [
  "article",
  "main",
  '[role="main"]',
  ".markdown-body",
  ".post-content",
  ".entry-content",
  ".article-content",
  ".content",
  "#content",
];

const TRANSLATED_MARK = "data-ai-translated";

function isSkipTag(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  if (SKIP_TAGS.has(tagName)) return true;
  if (element.hasAttribute("contenteditable")) return true;
  if (element.closest?.("[data-ai-translated]")) return true;
  return false;
}

function findMainContent(doc: Document): Element | null {
  for (const selector of CONTENT_SELECTORS) {
    const element = doc.querySelector(selector);
    if (element) return element;
  }
  return doc.body;
}

function createTreeWalker(root: Element): TreeWalker {
  return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      if (isSkipTag(parent)) return NodeFilter.FILTER_REJECT;

      const text = node.textContent?.trim() || "";
      if (text.length < 20) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });
}

export interface TextNode {
  node: Text;
  rect: DOMRect;
}

export function scanTextNodes(root: Element): TextNode[] {
  const walker = createTreeWalker(root);
  const nodes: TextNode[] = [];
  let node: Text | null;

  while ((node = walker.nextNode() as Text)) {
    if (node.parentElement?.closest?.(`[${TRANSLATED_MARK}]`)) continue;

    const rect = node.parentElement?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      nodes.push({ node, rect });
    }
  }

  return nodes;
}

export function findMainContentElement(doc: Document): Element {
  return findMainContent(doc) || doc.body;
}

export { TRANSLATED_MARK };
