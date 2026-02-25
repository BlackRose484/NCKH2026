import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  try {
    const { updates } = await request.json();
    const { resultId } = await context.params;
    
    console.log(`[API] Updating scores for result: ${resultId}`);
    console.log(`[API] Updates:`, updates);
    
    // Construct file path: results/result_TIMESTAMP.json
    const resultFilePath = join(process.cwd(), 'results', `${resultId}.json`);
    
    console.log(`[API] Reading file: ${resultFilePath}`);
    
    // Load the specific result file
    const resultData = JSON.parse(await readFile(resultFilePath, 'utf-8'));
    
    // Apply score updates
    updates.forEach((update: any) => {
      const answer = resultData.answers.find((a: any) => a.questionId === update.questionId);
      if (answer) {
        // Create textSentiment if it doesn't exist
        if (!answer.textSentiment) {
          answer.textSentiment = {
            score: 1, // Default neutral
            provider: 'Manual',
            source: 'fallback',
            analyzedAt: new Date().toISOString(),
          };
        }
        
        // ── Score History: always [LLM, latest teacher] ───────────
        // 1. Seed LLM entry once
        const llmEntry = {
          score: answer.textSentiment.score,
          author: 'llm',
          authorName: answer.textSentiment.provider ?? 'LLM',
          comment: answer.textSentiment.reasoning ?? undefined,
          timestamp: answer.textSentiment.analyzedAt,
        };
        // 2. Always overwrite — keep only LLM + latest teacher (max 2 entries)
        answer.textSentiment.scoreHistory = [
          llmEntry,
          {
            score: update.newScore,
            author: 'teacher',
            authorName: update.overriddenBy ?? 'Giáo viên',
            comment: update.reason ?? undefined,
            timestamp: update.overriddenAt,
          },
        ];

        // ── Backward-compat teacherOverride ───────────────────────
        answer.textSentiment.teacherOverride = {
          originalScore: update.originalScore,
          newScore: update.newScore,
          overriddenBy: update.overriddenBy,
          overriddenAt: update.overriddenAt,
          reason: update.reason,
        };
      }
    });
    
    // Save updated result back to the same file
    await writeFile(resultFilePath, JSON.stringify(resultData, null, 2));
    
    console.log(`[API] Successfully updated ${updates.length} scores in ${resultFilePath}`);
    
    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('[API] Error updating scores:', error);
    return NextResponse.json(
      { error: 'Failed to update scores', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
