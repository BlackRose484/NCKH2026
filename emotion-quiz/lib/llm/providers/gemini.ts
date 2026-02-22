import { BaseLLMProvider } from './base';
import { SentimentScore, AnalysisContext } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  async analyzeSentiment(context: AnalysisContext): Promise<SentimentScore> {
    try {
      const response = await this.withTimeout(
        () => this.callGemini(context)
      );

      return {
        score: this.parseScore(response.content),
        confidence: response.confidence,
        reasoning: response.reasoning,
        provider: this.getName(),
        source: 'llm',
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[${this.getName()}] Analysis failed:`, error);
      throw error;
    }
  }

  private async callGemini(context: AnalysisContext) {
    const prompt = this.buildPrompt(context);
    const model = this.config.model || 'gemini-pro';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        content,
        confidence: 0.8,
        reasoning: parsed.reasoning || content,
      };
    } catch {
      return {
        content,
        confidence: 0.7,
        reasoning: content,
      };
    }
  }

  private buildPrompt(context: AnalysisContext): string {
    return `
Phân tích cảm xúc của câu trả lời này từ một em nhỏ trong bài trắc nghiệm tâm lý.

Câu hỏi: "${context.questionText}"
Câu trả lời: "${context.answerText}"
Danh mục: ${context.category || 'Chung'}

Đánh giá cảm xúc:
- 0: Tích cực (vui vẻ, khỏe mạnh, lạc quan, mối quan hệ tốt)
- 1: Trung tính (bình thường, cân bằng, không rõ ràng)
- 2: Tiêu cực (buồn, lo lắng, đáng quan ngại, có vấn đề)

Trả lời CHỈ theo format JSON này:
{
  "score": 0 | 1 | 2,
  "reasoning": "giải thích ngắn gọn"
}
`.trim();
  }

  async isAvailable(): Promise<boolean> {
    return !!(this.config.enabled && this.config.apiKey);
  }
}
