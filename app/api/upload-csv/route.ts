import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import https from 'https';
import http from 'http';

// Function to download an image
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Check if the response is successful
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image: ${response.statusCode}`));
      }

      const chunks: Buffer[] = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
    }).on('error', reject);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      );
    }

    // Check if it's a CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Convert file to buffer and parse CSV
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const csvContent = buffer.toString();
    
    // Parse CSV content
    const records = parse(csvContent, {
      columns: false,
      skip_empty_lines: true
    });
    
    // Skip header row
    const dataRows = records.slice(1);
    
    // Create directories
    // Note: In Vercel, we can only write to /tmp
    const outputDir = path.join('/tmp', 'downloaded_images');
    await mkdir(outputDir, { recursive: true });
    
    const downloadedImages = [];
    let idCounter = 1;
    
    // Process each row (similar to Python script logic)
    const SKU_COL_INDEX = 2;  // Column 3 (0-based)
    const URL_COL_INDEX = 11; // Column L (0-based)
    
    for (let rowNum = 0; rowNum < dataRows.length; rowNum++) {
      const row = dataRows[rowNum];
      
      if (row.length <= URL_COL_INDEX || row.length <= SKU_COL_INDEX) {
        console.log(`Row ${rowNum + 2}: Missing required columns. Skipping.`);
        continue;
      }
      
      const sku = row[SKU_COL_INDEX].trim();
      const url = row[URL_COL_INDEX].trim();
      
      if (!sku || !url) {
        console.log(`Row ${rowNum + 2}: Missing SKU or URL. Skipping.`);
        continue;
      }
      
      try {
        // Download the image
        const imageBuffer = await downloadImage(url);
        
        // Get base filename from URL
        const urlParts = url.split('/');
        let baseFilename = urlParts[urlParts.length - 1] || 'image.jpg';
        
        // If filename contains query parameters, remove them
        if (baseFilename.includes('?')) {
          baseFilename = baseFilename.split('?')[0];
        }
        
        const filename = `id_${idCounter}_${sku}_${baseFilename}`;
        const outputPath = path.join(outputDir, filename);
        
        // Write the image file
        await writeFile(outputPath, imageBuffer);
        
        // Store information about the downloaded image
        const imageData = {
          id: idCounter,
          sku,
          original_url: url,
          filename,
          path: `/downloaded_images/${filename}`, // Path for client access
          row: rowNum + 2
        };
        
        downloadedImages.push(imageData);
        console.log(`Downloaded: ${outputPath}`);
        idCounter++;
        
      } catch (error) {
        console.error(`Row ${rowNum + 2}: Failed to download ${url} [SKU: ${sku}]. Error:`, error);
      }
    }
    
    // Write summary JSON
    const summary = {
      total_images: downloadedImages.length,
      images: downloadedImages
    };
    
    const summaryPath = path.join(outputDir, "download_summary.json");
    await writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    // For Vercel deployment, you should use a storage solution like Vercel Blob Storage
    // or upload to an S3-compatible service instead of local files
    
    return NextResponse.json({
      message: 'Images downloaded successfully',
      imageDirectory: '/downloaded_images',
      summary: summary
    });
    
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process CSV upload', details: errorMessage },
      { status: 500 }
    );
  }
} 