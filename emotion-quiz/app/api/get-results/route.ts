import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { QuizResult } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const resultsDir = join(process.cwd(), 'results');
    
    // Read all files in results directory
    const files = await readdir(resultsDir);
    
    // Filter for JSON files and read their contents
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const results: QuizResult[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const filepath = join(resultsDir, file);
        const content = await readFile(filepath, 'utf-8');
        return JSON.parse(content) as QuizResult;
      })
    );

    // Sort by timestamp (newest first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Error reading results:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read results',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
