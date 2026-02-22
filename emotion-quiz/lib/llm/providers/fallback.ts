import { BaseLLMProvider } from './base';
import { SentimentScore, AnalysisContext } from '../types';

export class FallbackProvider extends BaseLLMProvider {
  async analyzeSentiment(context: AnalysisContext): Promise<SentimentScore> {
    console.log(`[${this.getName()}] Using fallback keyword analysis`);

    // Simple keyword-based analysis
    const score = this.analyzeKeywords(context.answerText);

    return {
      score,
      confidence: 0.3,
      reasoning: 'Fallback keyword analysis',
      provider: this.getName(),
      source: 'fallback',
      analyzedAt: new Date().toISOString(),
    };
  }

  private analyzeKeywords(text: string): 0 | 1 | 2 {
    const lower = text.toLowerCase();

    // Positive keywords (Vietnamese & English)
    const positiveKeywords = [
      'vui', 'hạnh phúc', 'yêu', 'thích', 'tốt', 'tuyệt', 'vời', 'hay',
      'happy', 'love', 'good', 'great', 'wonderful', 'nice', 'enjoy',
      'quan tâm', 'hiểu', 'giúp', 'thân', 'gần gũi',
    ];

    // Negative keywords (Vietnamese & English)
    const negativeKeywords = [
      'buồn', 'khóc', 'sợ', 'ghét', 'tức', 'giận', 'lo', 'lắng',
      'sad', 'cry', 'fear', 'hate', 'angry', 'worried', 'afraid',
      'không thích', 'xa cách', 'ít', 'không', 'chẳng', 'la mắng',
    ];

    const positiveCount = positiveKeywords.filter(kw => lower.includes(kw)).length;
    const negativeCount = negativeKeywords.filter(kw => lower.includes(kw)).length;

    if (positiveCount > negativeCount) return 0;
    if (negativeCount > positiveCount) return 2;
    return 1;
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }
}
