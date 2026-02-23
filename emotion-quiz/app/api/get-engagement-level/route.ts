import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_MICROSENSE_API_URL || 'https://91d3-14-162-206-182.ngrok-free.app';

export async function POST(request: NextRequest) {
  try {
    const { engagement_scores } = await request.json();
    console.log(engagement_scores);

    if (!Array.isArray(engagement_scores) || engagement_scores.length === 0) {
      return NextResponse.json(
        { error: 'Invalid engagement scores' },
        { status: 400 }
      );
    }
    
    // body: { engagement_scores: number[] } or similar
    const response = await fetch(`${API_URL}/get_level_engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(engagement_scores),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting engagement level:', error);
    return NextResponse.json(
      { error: 'Failed to get engagement level', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
