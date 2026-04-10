import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model = 'google/gemma-4-26b-a4b-it:free' } = body;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.get('origin') || 'https://ss-dev.vercel.app',
        'X-Title': 'SS Dev Code Editor',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Error:', data);
      return NextResponse.json(
        { error: data.error?.message || data.error || 'AI request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
