import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Call OpenAI API to check for watermark
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Is there a watermark in this image? Please answer with a single word 'yes' or 'no'." },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      }],
    });

    // Extract the response content
    const aiResponse = response.choices[0].message.content || '';
    
    // Check if the response contains "yes"
    const hasWatermark = aiResponse.toLowerCase().includes('yes');

    return NextResponse.json({
      hasWatermark,
      originalResponse: aiResponse
    });
    
  } catch (error: unknown) {
    console.error('Watermark detection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to detect watermark', details: errorMessage },
      { status: 500 }
    );
  }
} 