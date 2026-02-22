import { BaseLLMProvider } from './base';
import { SentimentScore, AnalysisContext } from '../types';

export class OpenAIProvider extends BaseLLMProvider {
  async analyzeSentiment(context: AnalysisContext): Promise<SentimentScore> {
    try {
      const response = await this.withTimeout(
        () => this.callOpenAI(context)
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

  private async callOpenAI(context: AnalysisContext) {
    const prompt = this.buildPrompt(context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a psychological assessment expert analyzing children\'s responses to psychological questions. Respond in JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        content,
        confidence: 0.8,
        reasoning: parsed.reasoning || content,
      };
    } catch {
      // If not JSON, use raw content
      return {
        content,
        confidence: 0.7,
        reasoning: content,
      };
    }
  }

  private buildPrompt(context: AnalysisContext): string {
    return `
Analyze the sentiment of this child's answer to a psychological question.

Question: "${context.questionText}"
Answer: "${context.answerText}"
Category: ${context.category || 'General'}

Rate the sentiment as:
- 0: Positive (happy, healthy, optimistic, shows good relationships)
- 1: Neutral (normal, balanced, neither positive nor negative)
- 2: Negative (sad, distressed, concerning, shows problems)

Respond ONLY in this JSON format:
{
  "score": 0 | 1 | 2,
  "reasoning": "brief explanation in Vietnamese"
}
`.trim();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.enabled || !this.config.apiKey) {
      return false;
    }

    try {
      // Quick health check
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
