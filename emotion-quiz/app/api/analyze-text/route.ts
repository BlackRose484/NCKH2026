import { NextRequest, NextResponse } from 'next/server';
import { getSentimentAnalyzer } from '@/lib/llm/analyzer';

export async function POST(request: NextRequest) {
  try {
    const { questionId, questionText, answerText, category } = await request.json();

    if (!answerText || String(answerText).trim().length === 0) {
      return NextResponse.json(
        { error: 'answerText is required' },
        { status: 400 }
      );
    }

    const analyzer = getSentimentAnalyzer();
    const result = await analyzer.analyze({
      questionId: Number(questionId),
      questionText: String(questionText || ''),
      answerText: String(answerText).trim(),
      category: String(category || ''),
    });

    console.log(`[analyze-text] Q${questionId} → score=${result.score} provider=${result.provider}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyze-text] Error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
