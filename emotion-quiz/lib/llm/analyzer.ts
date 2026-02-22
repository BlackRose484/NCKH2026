import { LLMProviderFactory, ProviderType } from './factory';
import { SentimentScore, AnalysisContext } from './types';
import { getLLMConfig } from '../config/llm.config';

export class SentimentAnalyzer {
  private providerChain: ProviderType[];

  constructor(providerChain?: ProviderType[]) {
    // Default chain: try OpenAI → Gemini → Fallback
    this.providerChain = providerChain || ['openai', 'gemini', 'fallback'];
  }

  /**
   * Analyze sentiment with automatic fallback
   */
  async analyze(context: AnalysisContext): Promise<SentimentScore> {
    console.log(`[SentimentAnalyzer] Analyzing Q${context.questionId}...`);

    for (const providerType of this.providerChain) {
      try {
        const config = getLLMConfig(providerType);
        
        // Skip disabled providers
        if (!config.enabled) {
          console.log(`[SentimentAnalyzer] ${providerType} is disabled, skipping`);
          continue;
        }

        const provider = LLMProviderFactory.createProvider(providerType, config);

        // Check availability
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.log(`[SentimentAnalyzer] ${providerType} is not available, skipping`);
          continue;
        }

        // Try analysis
        console.log(`[SentimentAnalyzer] Trying ${providerType}...`);
        const result = await provider.analyzeSentiment(context);
        
        console.log(`[SentimentAnalyzer] ✓ Success with ${providerType}`);
        return result;

      } catch (error) {
        console.error(`[SentimentAnalyzer] ${providerType} failed:`, error);
        // Continue to next provider
      }
    }

    // Should never reach here if fallback is in chain
    throw new Error('All providers failed');
  }

  /**
   * Batch analyze multiple contexts
   */
  async analyzeBatch(contexts: AnalysisContext[]): Promise<SentimentScore[]> {
    return Promise.all(contexts.map(ctx => this.analyze(ctx)));
  }
}

// Singleton instance
let analyzerInstance: SentimentAnalyzer | null = null;

export function getSentimentAnalyzer(): SentimentAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new SentimentAnalyzer();
  }
  return analyzerInstance;
}
