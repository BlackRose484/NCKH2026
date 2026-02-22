import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { QuizResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const result: QuizResult = await request.json();

    // Create results directory if it doesn't exist
    const resultsDir = join(process.cwd(), 'results');
    try {
      await mkdir(resultsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // CRITICAL: Use timestamp from result object, not create new one!
    // This ensures filename matches result.timestamp
    const timestamp = result.timestamp.replace(/[:.]/g, '-');
    const filename = `result_${timestamp}.json`;
    const filepath = join(resultsDir, filename);

    // Write result to file
    await writeFile(filepath, JSON.stringify(result, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      filename,
      message: 'Result saved successfully',
    });
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save result',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
