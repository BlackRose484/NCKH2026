import { LLMProviderConfig } from '../llm/types';
import { ProviderType } from '../llm/factory';

export function getLLMConfig(provider: ProviderType): LLMProviderConfig {
  const configs: Record<ProviderType, LLMProviderConfig> = {
    openai: {
      name: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      enabled: process.env.ENABLE_OPENAI === 'true',
      timeout: 15000,
      maxRetries: 2,
    },
    gemini: {
      name: 'Gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      enabled: !!(process.env.GEMINI_API_KEY), // auto-enable if key present
      timeout: 15000,
      maxRetries: 2,
    },
    fallback: {
      name: 'Fallback',
      enabled: true,
      timeout: 1000,
      maxRetries: 1,
    },
  };

  return configs[provider];
}
