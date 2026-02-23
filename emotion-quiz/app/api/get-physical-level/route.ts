import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_MICROSENSE_API_URL || 'https://91d3-14-162-206-182.ngrok-free.app';

// POST /api/get-physical-level
// Body: { emotions: string[] }  e.g. ["Happy", "Neutral", "Sad"]
export async function POST(request: NextRequest) {
  try {
    const { emotions } = await request.json();

    if (!Array.isArray(emotions) || emotions.length === 0) {
      return NextResponse.json(
        { error: 'emotions must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/get_level_physical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(emotions),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting physical level:', error);
    return NextResponse.json(
      {
        error: 'Failed to get physical level',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
