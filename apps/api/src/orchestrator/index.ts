import type { AIProvider, AIConfig, ProviderType, TranslateOptions } from "../providers/types.ts";
import { createProvider } from "../providers/index.ts";

export interface RoutingConfig {
  translate: ProviderType;
  explain: ProviderType;
  summarize: ProviderType;
}

const DEFAULT_CONFIG: RoutingConfig = {
  translate: "deepseek",
  explain: "openai",
  summarize: "deepseek",
};

export class AIOrchestrator {
  private providers: Map<ProviderType, AIProvider> = new Map();
  private routing: RoutingConfig;

  constructor(config: Partial<RoutingConfig> = {}) {
    this.routing = { ...DEFAULT_CONFIG, ...config };
    this.initProviders();
  }

  private initProviders() {
    const uniqueProviders = new Set(Object.values(this.routing));
    for (const providerType of uniqueProviders) {
      this.providers.set(providerType, createProvider({ provider: providerType }));
    }
  }

  async translate(text: string, options?: TranslateOptions) {
    // 如果 options 指定了 provider，优先使用
    const providerType = options?.provider || this.routing.translate;
    let provider = this.providers.get(providerType);

    // 如果还没有初始化这个 provider，动态创建
    if (!provider) {
      provider = createProvider({ provider: providerType });
      this.providers.set(providerType, provider);
    }

    return provider.translate(text, options);
  }

  async explain(text: string, options?: Parameters<AIProvider["explain"]>[1]) {
    const providerType = options?.provider || this.routing.explain;
    let provider = this.providers.get(providerType);

    if (!provider) {
      provider = createProvider({ provider: providerType });
      this.providers.set(providerType, provider);
    }

    return provider.explain(text, options);
  }
}
