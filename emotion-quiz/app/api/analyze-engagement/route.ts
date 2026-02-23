import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_MICROSENSE_API_URL || 'https://91d3-14-162-206-182.ngrok-free.app';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append('video', videoFile);

    const response = await fetch(`${API_URL}/predict_engagement_video`, {
      method: 'POST',
      body: apiFormData,
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error analyzing engagement:', error);
    return NextResponse.json(
      { error: 'Failed to analyze engagement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
