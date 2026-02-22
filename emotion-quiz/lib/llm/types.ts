export interface SentimentScore {
  score: 0 | 1 | 2;  // 0: positive, 1: neutral, 2: negative
  confidence?: number;
  reasoning?: string;
  provider: string;
  source: 'llm' | 'fallback';
  analyzedAt: string;
  error?: string;
}

export interface LLMProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
  timeout?: number;
  maxRetries?: number;
}

export interface AnalysisContext {
  questionId: number;
  questionText: string;
  answerText: string;
  category?: string;
}

export abstract class LLMSentimentAnalyzer {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  /**
   * Analyze sentiment of text
   */
  abstract analyzeSentiment(
    context: AnalysisContext
  ): Promise<SentimentScore>;

  /**
   * Check if provider is available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Get provider name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get timeout in ms
   */
  getTimeout(): number {
    return this.config.timeout || 10000;
  }
}
