import { LLMProviderConfig } from '../llm/types';
import { ProviderType } from '../llm/factory';

export function getLLMConfig(provider: ProviderType): LLMProviderConfig {
  const configs: Record<ProviderType, LLMProviderConfig> = {
    openai: {
      name: 'OpenAI',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      enabled: process.env.NEXT_PUBLIC_ENABLE_OPENAI === 'true',
      timeout: 10000,
      maxRetries: 3,
    },
    gemini: {
      name: 'Gemini',
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-pro',
      enabled: process.env.NEXT_PUBLIC_ENABLE_GEMINI === 'true',
      timeout: 10000,
      maxRetries: 3,
    },
    fallback: {
      name: 'Fallback',
      enabled: true, // Always enabled
      timeout: 1000,
      maxRetries: 1,
    },
  };

  return configs[provider];
}
