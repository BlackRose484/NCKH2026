import { BaseLLMProvider } from './base';
import { SentimentScore, AnalysisContext } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  async analyzeSentiment(context: AnalysisContext): Promise<SentimentScore> {
    try {
      const response = await this.withTimeout(
        () => this.callGemini(context)
      );

      // Prefer score extracted from JSON by callGemini; fall back to regex
      const score: 0 | 1 | 2 =
        response.score != null && [0, 1, 2].includes(response.score as number)
          ? (response.score as 0 | 1 | 2)
          : this.parseScore(response.content);

      return {
        score,
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
    const model = this.config.model || 'gemini-2.0-flash';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawContent: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences that Gemini often adds: ```json ... ```
    const stripped = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // Try to parse JSON
    try {
      const parsed = JSON.parse(stripped);
      return {
        content: stripped,
        confidence: 0.85,
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : stripped,
        score: parsed.score,
      };
    } catch {
      // Not valid JSON — fall back to raw text
      return {
        content: stripped,
        confidence: 0.6,
        reasoning: stripped,
        score: undefined,
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
