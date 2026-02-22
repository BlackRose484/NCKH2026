import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const filename = formData.get('filename') as string;
    const resultId = formData.get('resultId') as string; // Unique per quiz session

    if (!videoFile || !filename || !resultId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create result folder in videos directory
    const resultDir = join(process.cwd(), 'videos', resultId);
    await mkdir(resultDir, { recursive: true });

    // Save video
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const filepath = join(resultDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filepath: `/videos/${resultId}/${filename}`,
    });
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
