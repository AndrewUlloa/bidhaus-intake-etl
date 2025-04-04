This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Features

- CSV file parsing and validation
- Product quality issue detection:
  - Vendor information in descriptions
  - Phone numbers in descriptions
  - Watermarks in product images (using OpenAI Vision)
- Image downloading from product URLs in CSV files
- Manual review interface for flagged issues

## Project Structure

- `/app` - Next.js 14 App Router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and validation logic
- `/public` - Static assets
- `/app/api` - Server API routes for processing CSV files and images
  - `/app/api/upload-csv` - Processes CSV uploads and image downloads
  - `/app/api/check-watermark` - Checks individual images for watermarks

## Watermark Detection

The application uses OpenAI's vision capabilities to automatically detect watermarks in product images:

1. When a CSV file is uploaded, all image URLs are processed
2. Each image is sent to the OpenAI API (using GPT-4o-mini)
3. The API analyzes the image and determines if a watermark is present
4. Images with detected watermarks are flagged for review

### Testing Watermark Detection

There are several ways to test the watermark detection feature:

#### 1. Using the test page

Visit [http://localhost:3000/test-watermark](http://localhost:3000/test-watermark) to access a dedicated testing interface. Here you can:

- Enter any image URL to check for watermarks
- See real-time results with toast notifications
- View sample test images with and without watermarks

#### 2. Using the CSV uploader

1. Prepare a CSV file with image URLs in column L (index 11)
2. Upload the CSV file using the main interface
3. Click "Download Images" in the Image Downloader component
4. The system will process all images and check for watermarks
5. Any detected watermarks will be added to the quality issues list

#### 3. Using the test script

For testing outside the UI:

```bash
# Run the test script
node scripts/test-watermark-detection.js
```

## Vercel Deployment

This project is optimized for deployment on Vercel. Due to Vercel's serverless environment:

1. Image processing is handled directly in the API routes using JavaScript
2. Images are temporarily stored in the `/tmp` directory
3. For production use, you should integrate with a storage solution:
   - [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
   - [Supabase Storage](https://supabase.com/docs/guides/storage)
   - Amazon S3
   - Cloudflare R2

### Storage Integration

To integrate with a cloud storage provider:

1. Install the necessary SDK (e.g., `@vercel/blob` for Vercel Blob)
2. Update the API route to upload images to the storage service
3. Return public URLs to the client

Example integration can be found in the [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob/quickstart).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
