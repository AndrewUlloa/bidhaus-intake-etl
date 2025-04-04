import { v4 as uuidv4 } from 'uuid';

export interface ProductData {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  vendor?: string;
  [key: string]: string | undefined;
}

export interface IssueType {
  type: "vendor_info" | "phone_number" | "watermark" | "other";
  description: string;
  details?: string;
}

export interface QualityIssue {
  id: string;
  productId: string;
  productName: string;
  issueTypes: IssueType[];  // Changed to array of issue types
  imageUrl?: string;
  resolved: boolean;
}

interface ValidationOptions {
  vendorRegex: string;
  phoneRegex: string;
  customRegexPatterns?: string;
  enableImageScanning?: boolean;
}

// Parse CSV string into array of objects
export function parseCSV(csvString: string): ProductData[] {
  const lines = csvString.split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(header => header.trim());
  
  // Find key field names - allow for different column names
  const idField = headers.find(h => /id/i.test(h)) || 'id';
  const nameField = headers.find(h => /name|title/i.test(h)) || 'name';
  const descField = headers.find(h => /desc|description/i.test(h)) || 'description';
  const imageField = headers.find(h => /image|img|photo|url/i.test(h)) || 'image';
  const vendorField = headers.find(h => /vendor|supplier|seller|consignor/i.test(h));

  console.log(`Found vendor column: ${vendorField || 'None'}`);
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(val => val.trim());
      const product: ProductData = {
        id: '',
        name: '',
        description: '',
      };

      headers.forEach((header, index) => {
        if (index < values.length) {
          if (header === idField) {
            product.id = values[index];
          } else if (header === nameField) {
            product.name = values[index];
          } else if (header === descField) {
            product.description = values[index];
          } else if (header === imageField) {
            product.imageUrl = values[index];
          } else if (vendorField && header === vendorField) {
            product.vendor = values[index];
          } else {
            product[header] = values[index];
          }
        }
      });

      // Generate ID if missing
      if (!product.id) {
        product.id = uuidv4();
      }

      return product;
    });
}

// Check if an image has a watermark
export async function checkImageForWatermark(
  imageUrl: string, 
  productName: string, 
  productId: string
): Promise<IssueType | null> {
  try {
    const response = await fetch('/api/check-watermark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl,
        productId,
        productName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Watermark check failed:', errorData.error || 'Unknown error');
      return null;
    }

    const data = await response.json();
    
    if (data.hasWatermark) {
      return {
        type: "watermark",
        description: "Potential watermark detected in product image"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking image for watermark:', error);
    return null;
  }
}

// Validate products for quality issues
export async function validateProducts(
  products: ProductData[],
  options: ValidationOptions,
  onIssueFound?: (issue: QualityIssue) => void // Callback for streaming updates
): Promise<QualityIssue[]> {
  // Use a Map to store issues by product ID
  const issueMap = new Map<string, QualityIssue>();
  
  // Create RegExp objects for regex-based validations
  const phoneRegex = new RegExp(options.phoneRegex, 'i');
  
  // Parse custom regex patterns if provided
  const customPatterns: RegExp[] = [];
  if (options.customRegexPatterns) {
    options.customRegexPatterns.split('\n')
      .filter(pattern => pattern.trim() !== '')
      .forEach(pattern => {
        try {
          customPatterns.push(new RegExp(pattern.trim(), 'i'));
        } catch (err) {
          console.error(`Invalid regex pattern "${pattern}":`, err);
        }
      });
  }

  // Process each product for text-based issues FIRST
  products.forEach(product => {
    // Skip products without descriptions
    if (!product.description) return;
    
    // Store issues for this product
    const productIssues: IssueType[] = [];
    
    // Check for vendor information in description using the vendor property
    if (product.vendor && product.vendor.trim() !== '') {
      // If the product has a vendor name, check if it appears in the description
      if (product.description.toLowerCase().includes(product.vendor.toLowerCase())) {
        productIssues.push({
          type: "vendor_info",
          description: `Description contains vendor name "${product.vendor}"`,
          details: product.vendor
        });
      }
    }
    
    // Check for phone numbers
    if (phoneRegex.test(product.description)) {
      const matches = product.description.match(phoneRegex);
      productIssues.push({
        type: "phone_number",
        description: `Description contains phone number: ${matches ? matches[0] : 'Unknown format'}`,
        details: matches ? matches[0] : undefined
      });
    }
    
    // Check custom patterns
    customPatterns.forEach((pattern, index) => {
      if (pattern.test(product.description)) {
        const matches = product.description.match(pattern);
        productIssues.push({
          type: "other",
          description: `Description matches custom pattern #${index + 1}`,
          details: matches ? matches[0] : undefined
        });
      }
    });
    
    // If we found any issues, create a quality issue for this product
    if (productIssues.length > 0) {
      const newIssue: QualityIssue = {
        id: product.id,  // Use product ID as the issue ID
        productId: product.id,
        productName: product.name,
        issueTypes: productIssues,
        imageUrl: product.imageUrl,
        resolved: false
      };
      
      issueMap.set(product.id, newIssue);
      
      // Notify immediately if callback provided
      if (onIssueFound) onIssueFound(newIssue);
    }
  });
  
  // AFTER processing text-based issues, check for watermarks in images
  if (options.enableImageScanning) {
    const productsWithImages = products.filter(product => product.imageUrl && product.imageUrl.trim() !== '');
    
    // Process images one by one instead of all at once
    for (const product of productsWithImages) {
      try {
        const watermarkIssue = await checkImageForWatermark(product.imageUrl!, product.name, product.id);
        
        if (watermarkIssue) {
          // Check if we already have an issue for this product
          if (issueMap.has(product.id)) {
            // Add watermark issue type to existing product issue
            const existingIssue = issueMap.get(product.id)!;
            existingIssue.issueTypes.push(watermarkIssue);
            
            // If callback provided, notify of update
            if (onIssueFound) onIssueFound(existingIssue);
          } else {
            // Create new issue with just the watermark issue type
            const newIssue: QualityIssue = {
              id: product.id,
              productId: product.id,
              productName: product.name,
              issueTypes: [watermarkIssue],
              imageUrl: product.imageUrl,
              resolved: false
            };
            
            issueMap.set(product.id, newIssue);
            
            // Notify if callback provided
            if (onIssueFound) onIssueFound(newIssue);
          }
        }
      } catch (error) {
        console.error('Error checking image for watermark:', error);
      }
    }
  }
  
  // Convert Map values to array
  return Array.from(issueMap.values());
} 