import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { QuizResult } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await context.params;
    
    console.log(`[API] Getting result: ${resultId}`);
    
    // Construct file path: results/result_TIMESTAMP.json
    const resultFilePath = join(process.cwd(), 'results', `${resultId}.json`);
    
    console.log(`[API] Reading file: ${resultFilePath}`);
    
    // Load the specific result file
    const content = await readFile(resultFilePath, 'utf-8');
    const result: QuizResult = JSON.parse(content);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[API] Error reading result:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read result',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
