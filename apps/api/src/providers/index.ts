import type { AIProvider, AIConfig, ModelType } from "./types.ts";
import { DeepSeekProvider } from "./deepseek.ts";
import { OpenAIProvider } from "./openai.ts";

const PROVIDERS: Record<ModelType, new () => AIProvider> = {
  deepseek: DeepSeekProvider,
  openai: OpenAIProvider,
  claude: DeepSeekProvider,
  gemini: DeepSeekProvider,
};

export function createProvider(config: AIConfig): AIProvider {
  const ProviderClass = PROVIDERS[config.provider];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
  return new ProviderClass();
}

export { DeepSeekProvider, OpenAIProvider } from "./deepseek.ts";
export { OpenAIProvider as OpenAIProvider2 } from "./openai.ts";
