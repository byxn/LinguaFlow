import type { AIProvider, AIConfig, ProviderType } from "./types.ts";
import { DeepSeekProvider } from "./deepseek.ts";
import { OpenAIProvider } from "./openai.ts";
import { DeepLProvider } from "./deepl.ts";
import { GoogleProvider } from "./google.ts";

const PROVIDERS: Record<ProviderType, new () => AIProvider> = {
  deepseek: DeepSeekProvider,
  openai: OpenAIProvider,
  deepl: DeepLProvider,
  google: GoogleProvider,
};

export function createProvider(config: AIConfig): AIProvider {
  const ProviderClass = PROVIDERS[config.provider];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
  return new ProviderClass();
}

export { DeepSeekProvider } from "./deepseek.ts";
export { OpenAIProvider } from "./openai.ts";
export { DeepLProvider } from "./deepl.ts";
export { GoogleProvider } from "./google.ts";
