import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_MICROSENSE_API_URL || 'https://32d7aa946edd.ngrok-free.app';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Create new FormData for API request
    const apiFormData = new FormData();
    apiFormData.append('file', videoFile);

    // Call Microsense API
    const response = await fetch(`${API_URL}/predict_emotion_video`, {
      method: 'POST',
      body: apiFormData,
      headers: {
        // ngrok might require this header
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze emotion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
