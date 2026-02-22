import { LLMSentimentAnalyzer, LLMProviderConfig } from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { FallbackProvider } from './providers/fallback';

export type ProviderType = 'openai' | 'gemini' | 'fallback';

export class LLMProviderFactory {
  private static providers: Map<ProviderType, LLMSentimentAnalyzer> = new Map();

  static createProvider(
    type: ProviderType,
    config: LLMProviderConfig
  ): LLMSentimentAnalyzer {
    // Check cache
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    // Create new provider
    let provider: LLMSentimentAnalyzer;

    switch (type) {
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      case 'fallback':
        provider = new FallbackProvider(config);
        break;
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }

    // Cache it
    this.providers.set(type, provider);
    return provider;
  }

  static clearCache() {
    this.providers.clear();
  }
}
