export function createTooltip(message: string, isError = false): HTMLElement {
  const tooltip = document.createElement("div");
  tooltip.className = "ai-overlay-tooltip";

  const messageEl = document.createElement("span");
  messageEl.className = isError ? "ai-error" : "";
  messageEl.textContent = message;

  tooltip.appendChild(messageEl);
  return tooltip;
}

export function showTooltip(element: Element, message: string, isError = false) {
  const existingTooltip = document.querySelector(".ai-overlay-tooltip");
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const tooltip = createTooltip(message, isError);
  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  setTimeout(() => {
    tooltip.remove();
  }, 3000);
}

export function showLoadingTooltip(element: Element) {
  const existingTooltip = document.querySelector(".ai-overlay-tooltip");
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const tooltip = document.createElement("div");
  tooltip.className = "ai-overlay-tooltip";

  const loadingEl = document.createElement("span");
  loadingEl.className = "ai-loading";
  loadingEl.textContent = "Translating...";

  tooltip.appendChild(loadingEl);
  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  return tooltip;
}
