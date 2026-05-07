import type { AIProvider, AIConfig, ModelType } from "../providers/types.ts";
import { createProvider } from "../providers/index.ts";

export interface RoutingConfig {
  translate: ModelType;
  explain: ModelType;
  summarize: ModelType;
}

const DEFAULT_CONFIG: RoutingConfig = {
  translate: "deepseek",
  explain: "openai",
  summarize: "deepseek",
};

export class AIOrchestrator {
  private providers: Map<ModelType, AIProvider> = new Map();
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

  async translate(text: string, options?: Parameters<AIProvider["translate"]>[1]) {
    const provider = this.providers.get(this.routing.translate)!;
    return provider.translate(text, options);
  }

  async explain(text: string, options?: Parameters<AIProvider["explain"]>[1]) {
    const provider = this.providers.get(this.routing.explain)!;
    return provider.explain(text, options);
  }
}
