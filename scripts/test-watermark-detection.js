// This is a simple script to test the watermark detection functionality
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkForWatermark(imageUrl) {
  try {
    console.log(`Checking image for watermark: ${imageUrl}`);
    
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

    const aiResponse = response.choices[0].message.content;
    console.log(`OpenAI response: ${aiResponse}`);
    
    const hasWatermark = aiResponse.toLowerCase().includes('yes');
    console.log(`Image has watermark: ${hasWatermark}`);
    
    return hasWatermark;
  } catch (error) {
    console.error('Error checking for watermark:', error);
    return false;
  }
}

// Example images to test
const testImages = [
  // Example image with watermark
  "https://cdn.pixabay.com/photo/2022/05/12/19/11/watermark-7192559_1280.jpg",
  // Example image without watermark (nature image)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
];

// Run tests
async function runTests() {
  for (const imageUrl of testImages) {
    await checkForWatermark(imageUrl);
    console.log('-'.repeat(50));
  }
}

runTests().catch(console.error); 