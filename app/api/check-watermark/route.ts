import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { IssueType } from '@/lib/utils/validation';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId, productName } = await request.json();

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
          { type: "text", text: "Examine this product image carefully and identify if there are any watermarks that don't belong to the product itself. Look for semi-transparent text, company names, website URLs, or photographer credits embedded in the image. A signed product or sharpie cursive signature is not a watermark. Please answer with a single word 'yes' if you detect any watermarks or 'no' if the image appears clean." },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            },
          },
        ],
      }],
    });

    // Extract the response content
    const aiResponse = response.choices[0].message.content || '';
    
    // Check if the response contains "yes"
    const hasWatermark = aiResponse.toLowerCase().includes('yes');

    // Create an issue type if a watermark was detected
    let issueType: IssueType | null = null;
    if (hasWatermark) {
      issueType = {
        type: "watermark",
        description: "Potential watermark detected in product image",
        details: aiResponse
      };
    }

    return NextResponse.json({
      hasWatermark,
      originalResponse: aiResponse,
      issueType,
      productId,
      productName,
      imageUrl
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