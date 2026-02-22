import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoPath = searchParams.get('path'); // e.g., "videos/result_XXX/q1.webm"

  if (!videoPath) {
    return NextResponse.json(
      { error: 'Missing video path' },
      { status: 400 }
    );
  }

  try {
    // Read from project root
    const filepath = join(process.cwd(), videoPath);
    console.log(`[get-video] Reading: ${filepath}`);
    
    // Get file stats
    const fileStats = await stat(filepath);
    const fileSize = fileStats.size;
    
    // Check for Range header (required for video streaming)
    const range = request.headers.get('range');
    
    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      console.log(`[get-video] Range request: ${start}-${end}/${fileSize}`);
      
      // Read the requested chunk
      const buffer = await readFile(filepath);
      const chunk = buffer.slice(start, end + 1);
      
      return new NextResponse(chunk, {
        status: 206, // Partial Content
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/webm',
        },
      });
    } else {
      // No range, send entire file
      const buffer = await readFile(filepath);
      console.log(`[get-video] Success: ${filepath}, size: ${buffer.length} bytes`);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'video/webm',
          'Content-Length': buffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
  } catch (error) {
    console.error('[get-video] Error reading video:', error);
    console.error('[get-video] Path:', videoPath);
    return NextResponse.json(
      { error: 'Video not found', path: videoPath },
      { status: 404 }
    );
  }
}
