import { NextRequest, NextResponse } from 'next/server';

// Note: Replace with your own Google AI API key from https://aistudio.google.com/app/apikey
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY';
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Extract the last user message for Gemini
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const prompt = lastUserMessage?.content || '';

    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google AI Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'AI request failed' },
        { status: response.status }
      );
    }

    // Transform Gemini response to OpenRouter format for compatibility
    const transformedResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
        }
      }]
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
