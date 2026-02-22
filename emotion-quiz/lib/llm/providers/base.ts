import { LLMSentimentAnalyzer, SentimentScore, AnalysisContext } from '../types';

export abstract class BaseLLMProvider extends LLMSentimentAnalyzer {
  /**
   * Common retry logic with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[${this.getName()}] Attempt ${attempt}/${maxRetries} failed:`,
          error
        );

        if (attempt < maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Common timeout wrapper
   */
  protected async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.getTimeout();

    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]);
  }

  /**
   * Parse score from LLM response
   */
  protected parseScore(response: string): 0 | 1 | 2 {
    const lower = response.toLowerCase();
    
    // Look for explicit scores in JSON
    if (lower.includes('"score":0') || lower.includes('"score": 0')) return 0;
    if (lower.includes('"score":1') || lower.includes('"score": 1')) return 1;
    if (lower.includes('"score":2') || lower.includes('"score": 2')) return 2;
    
    // Look for keywords
    if (lower.includes('positive') || lower.includes('tích cực')) return 0;
    if (lower.includes('negative') || lower.includes('tiêu cực')) return 2;
    
    // Default to neutral
    return 1;
  }
}
